import { Inject, Injectable } from "@nestjs/common";

import type { DecisionChatResponse } from "@commerce/contracts";
import {
  AssistantInventedValueError,
  inventsValue,
  type DecisionAssistant
} from "@commerce/decision";

import { PgChatRepository } from "../persistence/pg-chat.repository.js";

export const DECISION_ASSISTANT = Symbol("DECISION_ASSISTANT");

/**
 * Decision Chat (`US-DEC-F03-001`).
 *
 * The order of operations is the Story: build the brief from the current
 * Decision Context, ask the assistant, check the answer, and only then record
 * anything. A reply that states a figure the brief never contained is
 * withheld — the person is told it could not be answered rather than told a
 * number nobody published.
 *
 * Nothing here can select an Offering, begin a handoff or choose a contact
 * channel. AC-7 and AC-8 hold because there is no such call to make: the
 * service has one dependency that returns text and one that stores it.
 */
@Injectable()
export class ChatService {
  constructor(
    private readonly chats: PgChatRepository,
    @Inject(DECISION_ASSISTANT)
    private readonly assistant: DecisionAssistant
  ) {}

  async ask(input: {
    decisionFlowId: string;
    priorities: readonly string[];
    question: string;
  }): Promise<DecisionChatResponse> {
    return this.chats.transact(async (client) => {
      const brief = await this.chats.brief(
        client,
        input.decisionFlowId,
        input.priorities
      );
      const previous = await this.chats.turns(client, input.decisionFlowId);

      const reply = await this.assistant.respond({
        brief,
        question: input.question,
        turns: previous.turns.map((turn) => ({
          question: turn.question,
          reply: turn.reply
        }))
      });

      // AC-6, enforced without trusting the adapter. A vendor that ignored its
      // brief would fail here rather than reach a person.
      if (inventsValue(reply, brief)) throw new AssistantInventedValueError();

      await this.chats.record(client, {
        decisionFlowId: input.decisionFlowId,
        question: input.question,
        reply
      });
      return this.chats.turns(client, input.decisionFlowId);
    });
  }

  async history(decisionFlowId: string): Promise<DecisionChatResponse> {
    return this.chats.transact((client) =>
      this.chats.turns(client, decisionFlowId)
    );
  }
}
