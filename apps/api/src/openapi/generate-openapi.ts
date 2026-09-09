import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { format } from "prettier";

const errorResponse = (description: string) => ({
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorEnvelope" }
    }
  },
  description
});

/// The five Platform administration operations differ only in what they do, so
/// their shared shape is written once.
const adminOfferingParameter = {
  in: "path",
  name: "offeringId",
  required: true,
  schema: { format: "uuid", type: "string" }
};

const adminEditorialParameter = {
  in: "path",
  name: "id",
  required: true,
  schema: { format: "uuid", type: "string" }
};

const affiliateDestinationResponse = (description: string) => ({
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/AffiliateDestination" }
    }
  },
  description
});

const healthOperation = (operationId: string, unavailable?: string) => ({
  operationId,
  responses: {
    "200": {
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/HealthResponse" }
        }
      },
      description: "Service is healthy"
    },
    ...(unavailable === undefined ? {} : { "503": errorResponse(unavailable) })
  },
  tags: ["Health"]
});

/**
 * How a Domain key is published.
 *
 * **This was an `enum` of three, written out at six sites.** PRD-0001 v4.0 §E
 * makes the Domain set open, so an enumerated list here would have told every
 * client that a fourth Domain is invalid — and a generated client would have
 * refused the response before anybody read it. Declared once, because six
 * copies of one fact is how the closed set survived as long as it did.
 */
const DOMAIN_KEY = {
  description: "The Domain's stable key. PRD-0001 v4.0 §E: the set is open.",
  maxLength: 80,
  pattern: "^[A-Z0-9]+(?:_[A-Z0-9]+)*$",
  type: "string"
} as const;

const DOMAIN_NAME = { maxLength: 160, type: "string" } as const;

const document = {
  components: {
    schemas: {
      ErrorEnvelope: {
        additionalProperties: false,
        properties: {
          code: { type: "string" },
          correlationId: { format: "uuid", type: "string" },
          fieldErrors: {
            additionalProperties: {
              items: { type: "string" },
              type: "array"
            },
            type: "object"
          },
          message: { type: "string" }
        },
        required: ["code", "correlationId", "message"],
        type: "object"
      },
      HealthResponse: {
        additionalProperties: false,
        properties: {
          service: { enum: ["api"], type: "string" },
          status: { enum: ["ok"], type: "string" }
        },
        required: ["service", "status"],
        type: "object"
      },
      BeginRegistration: {
        additionalProperties: false,
        properties: {
          email: { format: "email", maxLength: 320, type: "string" },
          name: {
            description:
              "The name the registration form asks for (I62). Optional, because it is optional in the form and because every account created before the field existed has none. It buys a byline: a product review needs a name on it, and the alternative to a supplied one is an email address in public or an invented handle. Published masked — given name plus surname initial — never in full.",
            maxLength: 80,
            minLength: 1,
            type: ["string", "null"]
          },
          password: { maxLength: 256, minLength: 12, type: "string" }
        },
        required: ["email", "password"],
        type: "object"
      },
      ConfirmRegistration: {
        additionalProperties: false,
        properties: { token: { maxLength: 200, minLength: 1, type: "string" } },
        required: ["token"],
        type: "object"
      },
      BeginPasswordReset: {
        additionalProperties: false,
        properties: {
          email: { format: "email", maxLength: 320, type: "string" }
        },
        required: ["email"],
        type: "object"
      },
      CompletePasswordReset: {
        additionalProperties: false,
        properties: {
          password: { maxLength: 256, minLength: 12, type: "string" },
          token: { maxLength: 200, minLength: 1, type: "string" }
        },
        required: ["password", "token"],
        type: "object"
      },
      Login: {
        additionalProperties: false,
        properties: {
          email: { format: "email", maxLength: 320, type: "string" },
          password: { maxLength: 256, minLength: 1, type: "string" }
        },
        required: ["email", "password"],
        type: "object"
      },
      Session: {
        additionalProperties: false,
        properties: {
          adminAuthorized: { type: "boolean" },
          adminContext: { type: "boolean" },
          selectedBusinessId: { format: "uuid", type: ["string", "null"] },
          status: { enum: ["ENABLED", "SUSPENDED"], type: "string" },
          userId: { format: "uuid", type: "string" }
        },
        required: [
          "adminAuthorized",
          "adminContext",
          "selectedBusinessId",
          "status",
          "userId"
        ],
        type: "object"
      },
      SelectBusinessContext: {
        additionalProperties: false,
        properties: { businessId: { format: "uuid", type: "string" } },
        required: ["businessId"],
        type: "object"
      },
      AuthorizedBusinesses: {
        additionalProperties: false,
        properties: {
          businesses: {
            items: {
              additionalProperties: false,
              properties: {
                id: { format: "uuid", type: "string" },
                name: { type: "string" },
                slug: { type: "string" }
              },
              required: ["id", "name", "slug"],
              type: "object"
            },
            type: "array"
          }
        },
        required: ["businesses"],
        type: "object"
      },
      CreateBusiness: {
        additionalProperties: false,
        properties: {
          name: { maxLength: 200, minLength: 1, type: "string" },
          slug: {
            maxLength: 120,
            minLength: 1,
            pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            type: "string"
          }
        },
        required: ["name", "slug"],
        type: "object"
      },
      OwnedBusiness: {
        additionalProperties: false,
        properties: {
          id: { format: "uuid", type: "string" },
          name: { type: "string" },
          publicExposure: {
            enum: ["ELIGIBLE", "INELIGIBLE"],
            type: "string"
          },
          slug: { type: "string" },
          status: { type: "string" }
        },
        required: ["id", "name", "publicExposure", "slug", "status"],
        type: "object"
      },
      OwnedBusinesses: {
        additionalProperties: false,
        properties: {
          businesses: {
            items: { $ref: "#/components/schemas/OwnedBusiness" },
            type: "array"
          }
        },
        required: ["businesses"],
        type: "object"
      },
      UpdateBusinessInformation: {
        additionalProperties: false,
        properties: {
          contactEmail: { maxLength: 320, type: ["string", "null"] },
          contactTelephone: { maxLength: 40, type: ["string", "null"] },
          contactUrl: { maxLength: 2048, type: ["string", "null"] },
          logoUrl: { maxLength: 2048, type: ["string", "null"] },
          name: { maxLength: 200, minLength: 1, type: "string" },
          shortDescription: { maxLength: 500, type: ["string", "null"] }
        },
        required: ["name"],
        type: "object"
      },
      BusinessInformation: {
        additionalProperties: false,
        properties: {
          contactEmail: { type: ["string", "null"] },
          contactTelephone: { type: ["string", "null"] },
          contactUrl: { type: ["string", "null"] },
          id: { format: "uuid", type: "string" },
          logoUrl: { type: ["string", "null"] },
          name: { type: "string" },
          publicExposure: { enum: ["ELIGIBLE", "INELIGIBLE"], type: "string" },
          shortDescription: { type: ["string", "null"] },
          slug: { type: "string" },
          status: { type: "string" }
        },
        required: [
          "contactEmail",
          "contactTelephone",
          "contactUrl",
          "id",
          "logoUrl",
          "name",
          "publicExposure",
          "shortDescription",
          "slug",
          "status"
        ],
        type: "object"
      },
      PublicBusinessIdentity: {
        additionalProperties: false,
        description:
          "The public Business identity set is exactly display name, supplied logo and supplied short description. Telephone, email and contact URL have no representation here at all.",
        properties: {
          logoUrl: { type: ["string", "null"] },
          name: { type: "string" },
          shortDescription: { type: ["string", "null"] }
        },
        required: ["logoUrl", "name", "shortDescription"],
        type: "object"
      },
      AttributeOption: {
        additionalProperties: false,
        properties: {
          active: { type: "boolean" },
          id: { format: "uuid", type: "string" },
          label: { type: "string" },
          stableKey: { type: "string" }
        },
        required: ["active", "id", "label", "stableKey"],
        type: "object"
      },
      Attribute: {
        additionalProperties: false,
        properties: {
          active: { type: "boolean" },
          categoryIds: {
            items: { format: "uuid", type: "string" },
            type: "array"
          },
          comparable: { type: "boolean" },
          filterable: { type: "boolean" },
          id: { format: "uuid", type: "string" },
          name: { type: "string" },
          options: {
            items: { $ref: "#/components/schemas/AttributeOption" },
            type: "array"
          },
          requiredForPublication: { type: "boolean" },
          stableKey: { type: "string" },
          unit: { maxLength: 40, type: ["string", "null"] },
          valueKind: { $ref: "#/components/schemas/AttributeValueKind" }
        },
        required: [
          "active",
          "categoryIds",
          "comparable",
          "filterable",
          "id",
          "name",
          "options",
          "requiredForPublication",
          "stableKey",
          "unit",
          "valueKind"
        ],
        type: "object"
      },
      Attributes: {
        additionalProperties: false,
        properties: {
          attributes: {
            items: { $ref: "#/components/schemas/Attribute" },
            type: "array"
          }
        },
        required: ["attributes"],
        type: "object"
      },
      AttributeValueKind: {
        description:
          "The five V1 value kinds. Text cannot be filterable, only Number may carry a unit, and the two Select kinds require at least one allowed value.",
        enum: ["TEXT", "NUMBER", "BOOLEAN", "SINGLE_SELECT", "MULTI_SELECT"],
        type: "string"
      },
      AttributeOptionInput: {
        additionalProperties: false,
        properties: {
          label: { maxLength: 160, minLength: 1, type: "string" },
          stableKey: {
            maxLength: 100,
            minLength: 1,
            pattern: "^[A-Z0-9]+(?:_[A-Z0-9]+)*$",
            type: "string"
          }
        },
        required: ["label", "stableKey"],
        type: "object"
      },
      CreateAttribute: {
        additionalProperties: false,
        properties: {
          categoryIds: {
            items: { format: "uuid", type: "string" },
            type: "array"
          },
          comparable: { type: "boolean" },
          filterable: { type: "boolean" },
          name: { maxLength: 160, minLength: 1, type: "string" },
          options: {
            items: { $ref: "#/components/schemas/AttributeOptionInput" },
            maxItems: 200,
            type: "array"
          },
          stableKey: {
            maxLength: 100,
            minLength: 1,
            pattern: "^[A-Z0-9]+(?:_[A-Z0-9]+)*$",
            type: "string"
          },
          unit: { maxLength: 40, type: ["string", "null"] },
          valueKind: { $ref: "#/components/schemas/AttributeValueKind" }
        },
        required: [
          "categoryIds",
          "comparable",
          "filterable",
          "name",
          "stableKey",
          "valueKind"
        ],
        type: "object"
      },
      UpdateAttributeProperties: {
        additionalProperties: false,
        properties: {
          comparable: { type: "boolean" },
          filterable: { type: "boolean" },
          name: { maxLength: 160, minLength: 1, type: "string" },
          unit: { maxLength: 40, type: ["string", "null"] }
        },
        required: ["comparable", "filterable", "name"],
        type: "object"
      },
      ChangeAttributeValueKind: {
        additionalProperties: false,
        properties: {
          valueKind: { $ref: "#/components/schemas/AttributeValueKind" }
        },
        required: ["valueKind"],
        type: "object"
      },
      SetAttributeCategories: {
        additionalProperties: false,
        properties: {
          categoryIds: {
            items: { format: "uuid", type: "string" },
            type: "array"
          }
        },
        required: ["categoryIds"],
        type: "object"
      },
      SetAttributeRequired: {
        additionalProperties: false,
        properties: { requiredForPublication: { type: "boolean" } },
        required: ["requiredForPublication"],
        type: "object"
      },
      RelabelAttributeOption: {
        additionalProperties: false,
        properties: {
          label: { maxLength: 160, minLength: 1, type: "string" }
        },
        required: ["label"],
        type: "object"
      },
      AvailableFilter: {
        additionalProperties: false,
        description:
          "A Filter that may be applied here. Offered only once one active leaf Category is selected, and only for an Attribute that applies to it and is filterable. Text Attributes can never appear.",
        properties: {
          attributeId: { format: "uuid", type: "string" },
          name: { type: "string" },
          options: {
            description: "Active allowed values, for the two Select kinds.",
            items: {
              additionalProperties: false,
              properties: {
                id: { format: "uuid", type: "string" },
                label: { type: "string" }
              },
              required: ["id", "label"],
              type: "object"
            },
            type: "array"
          },
          unit: { type: ["string", "null"] },
          valueKind: {
            enum: ["NUMBER", "BOOLEAN", "SINGLE_SELECT", "MULTI_SELECT"],
            type: "string"
          }
        },
        required: ["attributeId", "name", "options", "unit", "valueKind"],
        type: "object"
      },
      AppliedFilter: {
        description:
          "Selected values within one Select Filter combine with OR; different Filters combine with AND. An Offering with no value for an applied Filter does not satisfy it.",
        oneOf: [
          {
            additionalProperties: false,
            properties: {
              attributeId: { format: "uuid", type: "string" },
              kind: { enum: ["NUMBER"], type: "string" },
              max: {
                description: "Inclusive upper bound.",
                type: ["number", "null"]
              },
              min: {
                description: "Inclusive lower bound.",
                type: ["number", "null"]
              }
            },
            required: ["attributeId", "kind"],
            type: "object"
          },
          {
            additionalProperties: false,
            properties: {
              attributeId: { format: "uuid", type: "string" },
              kind: { enum: ["BOOLEAN"], type: "string" },
              value: { type: "boolean" }
            },
            required: ["attributeId", "kind", "value"],
            type: "object"
          },
          {
            additionalProperties: false,
            properties: {
              attributeId: { format: "uuid", type: "string" },
              kind: { enum: ["SELECT"], type: "string" },
              optionIds: {
                items: { format: "uuid", type: "string" },
                maxItems: 100,
                minItems: 1,
                type: "array"
              }
            },
            required: ["attributeId", "kind", "optionIds"],
            type: "object"
          }
        ]
      },
      ZeroResults: {
        additionalProperties: false,
        description:
          "Present only when nothing matched. The criteria are echoed rather than cleared, and the recovery list is closed — no Recommendations, sponsored alternatives, Saved Search, History, Notifications, Favorites or Messaging.",
        properties: {
          criteria: {
            additionalProperties: false,
            properties: {
              categoryName: { type: ["string", "null"] },
              filters: {
                description:
                  "Structured rather than phrased: the exact copy belongs to UX.",
                items: {
                  additionalProperties: false,
                  properties: {
                    attributeId: { format: "uuid", type: "string" },
                    kind: {
                      enum: [
                        "NUMBER",
                        "BOOLEAN",
                        "SINGLE_SELECT",
                        "MULTI_SELECT"
                      ],
                      type: "string"
                    },
                    max: { type: ["number", "null"] },
                    min: { type: ["number", "null"] },
                    name: { type: "string" },
                    optionLabels: { items: { type: "string" }, type: "array" },
                    value: { type: ["boolean", "null"] }
                  },
                  required: [
                    "attributeId",
                    "kind",
                    "max",
                    "min",
                    "name",
                    "optionLabels",
                    "value"
                  ],
                  type: "object"
                },
                type: "array"
              },
              query: { type: ["string", "null"] }
            },
            required: ["categoryName", "filters", "query"],
            type: "object"
          },
          recovery: {
            items: {
              enum: [
                "REMOVE_FILTER",
                "CLEAR_FILTERS",
                "CHANGE_QUERY",
                "CLEAR_QUERY",
                "MOVE_TO_PARENT_CATEGORY",
                "CHOOSE_ANOTHER_CATEGORY",
                "RETURN_TO_HOMEPAGE"
              ],
              type: "string"
            },
            type: "array"
          }
        },
        required: ["criteria", "recovery"],
        type: "object"
      },
      BrowseCategory: {
        additionalProperties: false,
        properties: {
          id: { format: "uuid", type: "string" },
          leaf: {
            description:
              "A leaf carries Results; a branch carries only navigation.",
            type: "boolean"
          },
          name: { type: "string" },
          slug: { type: "string" }
        },
        required: ["id", "leaf", "name", "slug"],
        type: "object"
      },
      Favourites: {
        additionalProperties: false,
        description:
          "What a person has kept (I64). The cards rather than the identifiers, drawn from the cheapest currently eligible seller of each kept product — so a favourite shows today's price rather than the price it was kept at. `unavailable` counts what is kept and no longer reachable (every seller withdrew, or moderation hid it); those rows are not deleted, because the person kept a product and the catalogue losing a way to buy it is not them changing their mind.",
        properties: {
          cards: {
            items: { $ref: "#/components/schemas/ListingCard" },
            type: "array"
          },
          unavailable: { minimum: 0, type: "integer" }
        },
        required: ["cards", "unavailable"],
        type: "object"
      },
      FavouriteMarks: {
        additionalProperties: false,
        description:
          "Which products this person has kept, as product group keys (I64). The one place keys are the right answer: a page of Listing Cards needs to know which hearts are filled and already holds the cards. Separate from the list so that rendering Results does not fetch a page of cards nobody is going to look at.",
        properties: {
          productGroupKeys: { items: { type: "string" }, type: "array" }
        },
        required: ["productGroupKeys"],
        type: "object"
      },
      Paging: {
        additionalProperties: false,
        description:
          "Where a person is in a list of products, and how long the list is (I63). `total` counts **products** — the same grouping the cards are drawn from — so a pager never promises more pages than the list has things in it. `pageSize` is published rather than assumed: a client cannot check a boundary it has to guess.",
        properties: {
          page: { minimum: 1, type: "integer" },
          pageSize: { minimum: 1, type: "integer" },
          total: { minimum: 0, type: "integer" }
        },
        required: ["page", "pageSize", "total"],
        type: "object"
      },
      ProductRating: {
        additionalProperties: false,
        description:
          "What people scored this **product**, and how many of them (I62). A product score and deliberately not a seller score: the average is taken over the reviews of the product group — the Offerings sharing a Product Key, PRD-0001 v4.0 §5.12's own definition — so the same thing answers with one number wherever it is sold, and PRD-0001 §4's exclusion of seller reputation stands untouched. `average` is a decimal string for the reason money is: 4.3 has no exact binary representation. `null` with `count: 0` is a product nobody has scored, which a surface must show as unrated rather than as zero stars.",
        properties: {
          average: { pattern: "^[1-5](?:\\.\\d)?$", type: ["string", "null"] },
          count: { minimum: 0, type: "integer" }
        },
        required: ["average", "count"],
        type: "object"
      },
      ListingCard: {
        additionalProperties: false,
        description:
          "The Listing Card product minimum. It carries no telephone, email, external contact URL or Affiliate Destination information — those have no representation here at all. `primaryVisualUrl` is the supplied primary visual or `null`; before I30 the shape had no field for one, so `US-DSC-F06-001` AC-4 could only ever be half true. `pricing` carries the whole PRD-0001 §5.10.1 union rather than a formatted amount: On Request is an answer and Unknown is an admission, and a card that flattened both to blank space would report a failure where none occurred.",
        properties: {
          businessName: { type: "string" },
          categoryName: { type: "string" },
          handoffAvailable: {
            description:
              "Whether this card may offer an Affiliate Handoff (`US-DSC-F06-001` v1.1 AC-9). A boolean and never an address: the Affiliate Destination stays absent from the card (AC-5) and is resolved server-side at the moment the person chooses, by the Affiliate Handoff `US-DEC-F05-001` owns. `false` where the Offering has no Eligible destination, which is the ordinary case rather than a failure.",
            type: "boolean"
          },
          listingNumber: {
            description:
              "The listing number a person reads, quotes and types (I67). Digits, as a string: it is an identifier rather than a quantity, and a number long enough to be unique is a number a JSON reader may round. Surfaces print it with the `\u0130LN-` prefix; typing it into Search returns that listing.",
            pattern: "^\\d+$",
            type: "string"
          },
          offeringId: { format: "uuid", type: "string" },
          pricing: { $ref: "#/components/schemas/OfferingPrice" },
          primaryVisualUrl: { type: ["string", "null"] },
          productKey: { type: ["string", "null"] },
          publishedAt: { format: "date-time", type: "string" },
          rating: { $ref: "#/components/schemas/ProductRating" },
          sellerCount: {
            description:
              "How many Offerings this card stands for. Offerings sharing a Product Key are presented as one product (PRD-0001 v4.0 §5.12.1); the count is taken over what the criteria admitted, so a filter that sets a seller aside also stops the card claiming it.",
            minimum: 1,
            type: "integer"
          },
          slug: { type: "string" },
          title: { type: "string" }
        },
        required: [
          "businessName",
          "categoryName",
          "handoffAvailable",
          "listingNumber",
          "offeringId",
          "pricing",
          "primaryVisualUrl",
          "productKey",
          "publishedAt",
          "rating",
          "sellerCount",
          "slug",
          "title"
        ],
        type: "object"
      },
      AdminAuditEvent: {
        additionalProperties: false,
        description:
          "One line of the Admin audit trail (I84). Carries no email address and no name: an actor and a target are account ids, like everywhere else on the Admin surfaces. A trail that named people would be a second place personal data lives, and the one place nobody would think to look for it.",
        properties: {
          actionType: {
            enum: [
              "PII_VIEW",
              "REQUEST_CORRECTION",
              "HIDE_OFFERING",
              "RESTORE_OFFERING",
              "RESTRICT_BUSINESS",
              "RESTORE_BUSINESS",
              "SUSPEND_USER",
              "REINSTATE_USER",
              "CASE_OPEN",
              "REVIEW_DESTINATION",
              "VALIDATE_DESTINATION_VALID",
              "VALIDATE_DESTINATION_INVALID",
              "ENABLE_DESTINATION",
              "DISABLE_DESTINATION"
            ],
            type: "string"
          },
          actorId: { format: "uuid", type: "string" },
          caseId: { format: "uuid", type: ["string", "null"] },
          id: { type: "string" },
          occurredAt: { format: "date-time", type: "string" },
          targetId: { format: "uuid", type: ["string", "null"] }
        },
        required: [
          "actionType",
          "actorId",
          "caseId",
          "id",
          "occurredAt",
          "targetId"
        ],
        type: "object"
      },
      EditorialSection: {
        additionalProperties: false,
        properties: {
          body: { maxLength: 8000, minLength: 1, type: "string" },
          heading: { maxLength: 160, minLength: 1, type: "string" }
        },
        required: ["body", "heading"],
        type: "object"
      },
      EditorialReview: {
        additionalProperties: false,
        properties: {
          byline: { maxLength: 120, minLength: 1, type: "string" },
          cons: {
            items: { maxLength: 280, minLength: 1, type: "string" },
            minItems: 1,
            type: "array"
          },
          lastCheckedAt: { format: "date-time", type: ["string", "null"] },
          productKey: { maxLength: 64, minLength: 1, type: "string" },
          pros: {
            items: { maxLength: 280, minLength: 1, type: "string" },
            minItems: 1,
            type: "array"
          },
          publishedAt: { format: "date-time", type: "string" },
          score: { maximum: 10, minimum: 0, type: "number" },
          sections: {
            items: { $ref: "#/components/schemas/EditorialSection" },
            minItems: 1,
            type: "array"
          },
          verdict: { maxLength: 280, minLength: 1, type: "string" }
        },
        required: [
          "byline",
          "cons",
          "lastCheckedAt",
          "productKey",
          "pros",
          "publishedAt",
          "score",
          "sections",
          "verdict"
        ],
        type: "object"
      },
      EditorialReviewView: {
        additionalProperties: false,
        properties: {
          review: {
            anyOf: [
              { $ref: "#/components/schemas/EditorialReview" },
              { type: "null" }
            ]
          }
        },
        required: ["review"],
        type: "object"
      },
      EditorialReviewAdmin: {
        additionalProperties: false,
        properties: {
          byline: { maxLength: 120, type: ["string", "null"] },
          cons: {
            items: { maxLength: 280, minLength: 1, type: "string" },
            type: "array"
          },
          createdAt: { format: "date-time", type: "string" },
          id: { format: "uuid", type: "string" },
          lastCheckedAt: { format: "date-time", type: ["string", "null"] },
          productKey: { maxLength: 64, minLength: 1, type: "string" },
          pros: {
            items: { maxLength: 280, minLength: 1, type: "string" },
            type: "array"
          },
          publishedAt: { format: "date-time", type: ["string", "null"] },
          score: { maximum: 10, minimum: 0, type: ["number", "null"] },
          sections: {
            items: { $ref: "#/components/schemas/EditorialSection" },
            type: "array"
          },
          status: { enum: ["DRAFT", "PUBLISHED", "WITHDRAWN"], type: "string" },
          verdict: { maxLength: 280, type: ["string", "null"] }
        },
        required: [
          "byline",
          "cons",
          "createdAt",
          "id",
          "lastCheckedAt",
          "productKey",
          "pros",
          "publishedAt",
          "score",
          "sections",
          "status",
          "verdict"
        ],
        type: "object"
      },
      EditorialReviewList: {
        additionalProperties: false,
        properties: {
          reviews: {
            items: { $ref: "#/components/schemas/EditorialReviewAdmin" },
            type: "array"
          }
        },
        required: ["reviews"],
        type: "object"
      },
      WriteEditorialDraft: {
        additionalProperties: false,
        properties: {
          byline: { maxLength: 120, type: ["string", "null"] },
          cons: {
            items: { maxLength: 280, minLength: 1, type: "string" },
            maxItems: 20,
            type: "array"
          },
          pros: {
            items: { maxLength: 280, minLength: 1, type: "string" },
            maxItems: 20,
            type: "array"
          },
          score: { maximum: 10, minimum: 0, type: ["number", "null"] },
          sections: {
            items: { $ref: "#/components/schemas/EditorialSection" },
            maxItems: 20,
            type: "array"
          },
          verdict: { maxLength: 280, type: ["string", "null"] }
        },
        required: ["cons", "pros", "sections"],
        type: "object"
      },
      WriteEditorialReview: {
        additionalProperties: false,
        properties: {
          byline: { maxLength: 120, type: ["string", "null"] },
          cons: {
            items: { maxLength: 280, minLength: 1, type: "string" },
            maxItems: 20,
            type: "array"
          },
          productKey: { maxLength: 64, minLength: 1, type: "string" },
          pros: {
            items: { maxLength: 280, minLength: 1, type: "string" },
            maxItems: 20,
            type: "array"
          },
          score: { maximum: 10, minimum: 0, type: ["number", "null"] },
          sections: {
            items: { $ref: "#/components/schemas/EditorialSection" },
            maxItems: 20,
            type: "array"
          },
          verdict: { maxLength: 280, type: ["string", "null"] }
        },
        required: ["cons", "productKey", "pros", "sections"],
        type: "object"
      },
      AdminAuditEvents: {
        additionalProperties: false,
        properties: {
          events: {
            items: { $ref: "#/components/schemas/AdminAuditEvent" },
            type: "array"
          },
          offset: { minimum: 0, type: "integer" },
          total: { minimum: 0, type: "integer" }
        },
        required: ["events", "offset", "total"],
        type: "object"
      },
      AdminUserAccount: {
        additionalProperties: false,
        description:
          "One account, as the Admin register shows it (I83). **No email address**, and that absence is the schema doing the enforcing rather than a query remembering to drop a field. `isAdmin` is present because it changes what is possible: an Admin-authorized account may not be moderated from this surface at all (AC-5), and a control offered and then refused is worse than one never offered.",
        properties: {
          businessCount: {
            description:
              "How many Businesses this account owns. Its own footprint, not anybody else\u0027s data.",
            minimum: 0,
            type: "integer"
          },
          isAdmin: { type: "boolean" },
          registeredAt: { format: "date-time", type: "string" },
          reviewCount: { minimum: 0, type: "integer" },
          status: {
            enum: ["ENABLED", "PENDING_VERIFICATION", "SUSPENDED"],
            type: "string"
          },
          userId: { format: "uuid", type: "string" }
        },
        required: [
          "businessCount",
          "isAdmin",
          "registeredAt",
          "reviewCount",
          "status",
          "userId"
        ],
        type: "object"
      },
      AdminUserAccounts: {
        additionalProperties: false,
        properties: {
          accounts: {
            items: { $ref: "#/components/schemas/AdminUserAccount" },
            type: "array"
          },
          total: { minimum: 0, type: "integer" }
        },
        required: ["accounts", "total"],
        type: "object"
      },
      CaseTargetEmail: {
        additionalProperties: false,
        description:
          "A revealed email address (I82). A response of its own rather than a field on the case: the Owner's PII rule turns on when the address travels — never in a list, and on a case page only after somebody asks — and a field would put it in every payload.",
        properties: { email: { format: "email", type: "string" } },
        required: ["email"],
        type: "object"
      },
      ComplementaryPlacement: {
        additionalProperties: false,
        description:
          "One complementary product a listing suggests. The partner is named on the row because a person about to leave the platform is entitled to know whose site they are going to before they press it. No identifier and no counter: nothing about a placement is measured.",
        properties: {
          destinationUrl: { type: "string" },
          label: { type: "string" },
          note: { type: ["string", "null"] },
          partnerName: { type: "string" }
        },
        required: ["destinationUrl", "label", "note", "partnerName"],
        type: "object"
      },
      ComplementaryPlacements: {
        additionalProperties: false,
        properties: {
          placements: {
            items: { $ref: "#/components/schemas/ComplementaryPlacement" },
            type: "array"
          }
        },
        required: ["placements"],
        type: "object"
      },
      AdminComplementaryPlacement: {
        additionalProperties: false,
        properties: {
          active: { type: "boolean" },
          categoryId: { format: "uuid", type: "string" },
          categoryName: { type: "string" },
          destinationUrl: { type: "string" },
          label: { type: "string" },
          note: { type: ["string", "null"] },
          partnerName: { type: "string" },
          placementId: { format: "uuid", type: "string" },
          position: { minimum: 0, type: "integer" }
        },
        required: [
          "active",
          "categoryId",
          "categoryName",
          "destinationUrl",
          "label",
          "note",
          "partnerName",
          "placementId",
          "position"
        ],
        type: "object"
      },
      AdminComplementaryPlacements: {
        additionalProperties: false,
        properties: {
          placements: {
            items: { $ref: "#/components/schemas/AdminComplementaryPlacement" },
            type: "array"
          }
        },
        required: ["placements"],
        type: "object"
      },
      CreateComplementaryPlacement: {
        additionalProperties: false,
        description:
          "A placement is written against a Category and inherited by every listing under it: the rule is about sections, and repeating it per listing would guarantee it stops being true somewhere. The address must parse as http or https.",
        properties: {
          categoryId: { format: "uuid", type: "string" },
          destinationUrl: { maxLength: 2048, minLength: 1, type: "string" },
          label: { maxLength: 120, minLength: 1, type: "string" },
          note: { maxLength: 240, type: ["string", "null"] },
          partnerName: { maxLength: 160, minLength: 1, type: "string" },
          position: { maximum: 99, minimum: 0, type: "integer" }
        },
        required: ["categoryId", "destinationUrl", "label", "partnerName"],
        type: "object"
      },
      AdvertisingExclusion: {
        additionalProperties: false,
        description:
          "One Category kept clear of advertising, and everything beneath it (PRD-0006 §20.4).",
        properties: {
          categoryId: { format: "uuid", type: "string" },
          categoryName: { type: "string" },
          excludedAt: { format: "date-time", type: "string" }
        },
        required: ["categoryId", "categoryName", "excludedAt"],
        type: "object"
      },
      AdvertisingSettings: {
        additionalProperties: false,
        description:
          "Whether advertising runs and where it may not (I75). Five named decisions rather than a settings store: PRD-0006 §12 refuses a generic Platform Configuration capability, so adding a sixth takes a migration. No impression, click or revenue figure is here, because §20.5 excludes all four and the platform records none of them.",
        properties: {
          enabled: {
            description:
              "The master switch. False suppresses every region including the platform's own complementary block, because a kill switch that needed somebody to remember its scope would not be one.",
            type: "boolean"
          },
          exclusions: {
            items: { $ref: "#/components/schemas/AdvertisingExclusion" },
            type: "array"
          },
          publisherId: { type: ["string", "null"] },
          units: { $ref: "#/components/schemas/AdvertisingUnits" },
          updatedAt: { format: "date-time", type: "string" }
        },
        required: [
          "enabled",
          "exclusions",
          "publisherId",
          "units",
          "updatedAt"
        ],
        type: "object"
      },
      AdvertisingUnits: {
        additionalProperties: false,
        description:
          "One unit identifier per permitted region (§20.1). A region with no unit shows nothing, which is a configuration state rather than a fault.",
        properties: {
          category: { type: ["string", "null"] },
          presentation: { type: ["string", "null"] },
          results: { type: ["string", "null"] }
        },
        required: ["category", "presentation", "results"],
        type: "object"
      },
      ExcludeCategoryFromAdvertising: {
        additionalProperties: false,
        properties: { categoryId: { format: "uuid", type: "string" } },
        required: ["categoryId"],
        type: "object"
      },
      UpdateAdvertisingSettings: {
        additionalProperties: false,
        description:
          "The whole form travels, because a partial write is how a kill switch ends up back on because somebody submitted the field beside it. A blank identifier is stored as absence, which is what clearing a field means.",
        properties: {
          enabled: { type: "boolean" },
          publisherId: { maxLength: 64, type: ["string", "null"] },
          units: {
            additionalProperties: false,
            properties: {
              category: { maxLength: 64, type: ["string", "null"] },
              presentation: { maxLength: 64, type: ["string", "null"] },
              results: { maxLength: 64, type: ["string", "null"] }
            },
            type: "object"
          }
        },
        required: ["enabled", "units"],
        type: "object"
      },
      FeedMapping: {
        additionalProperties: false,
        description:
          "Which key in the partner's record holds each thing the platform understands. A list of named fields rather than an expression language: a general one would let a partner's feed be configured into anything, which is a capability arriving without a decision. Only the identifier and the title are required.",
        properties: {
          categoryKey: { type: ["string", "null"] },
          currency: { type: ["string", "null"] },
          deliveryCost: { type: ["string", "null"] },
          externalId: {
            description:
              "The partner's own identifier for a product. Without one, every sync is a fresh import and the catalogue doubles every hour.",
            type: "string"
          },
          imageUrl: { type: ["string", "null"] },
          price: { type: ["string", "null"] },
          priorPrice: { type: ["string", "null"] },
          productKey: { type: ["string", "null"] },
          stock: { type: ["string", "null"] },
          summary: { type: ["string", "null"] },
          title: { type: "string" },
          url: { type: ["string", "null"] }
        },
        required: [
          "categoryKey",
          "currency",
          "deliveryCost",
          "externalId",
          "imageUrl",
          "price",
          "priorPrice",
          "productKey",
          "stock",
          "summary",
          "title",
          "url"
        ],
        type: "object"
      },
      OfferingFeedRun: {
        additionalProperties: false,
        description:
          'How one sync went (I76). A failed run is the point of this rather than an exception to it: a log recording only successes answers "when did this last work" and never "why did it stop".',
        properties: {
          created: {
            description:
              "Listings this run created. Zero on every run since I88, when the intake was scoped to price and stock; kept because the runs that did create listings happened.",
            minimum: 0,
            type: "integer"
          },
          failureKind: {
            description:
              "Why the run failed (I91): the partner's server could not be reached, the document could not be parsed, the mapping names fields the document does not carry, or something else. Null on a run that succeeded.",
            enum: [
              "SOURCE_UNREACHABLE",
              "DOCUMENT_UNREADABLE",
              "MAPPING_INCOMPLETE",
              "UNCLASSIFIED",
              null
            ],
            type: ["string", "null"]
          },
          feedId: { format: "uuid", type: "string" },
          feedName: { type: "string" },
          finishedAt: { format: "date-time", type: "string" },
          message: {
            description:
              "Why it failed, in words somebody can act on. Null on success.",
            type: ["string", "null"]
          },
          missing: {
            description:
              "Products the platform holds that the document no longer offers. A number and not an action: retiring a listing is a lifecycle decision, and one truncated response would otherwise delete a catalogue.",
            minimum: 0,
            type: "integer"
          },
          outcome: { enum: ["SUCCEEDED", "FAILED"], type: "string" },
          read: { minimum: 0, type: "integer" },
          rejected: { minimum: 0, type: "integer" },
          restored: {
            description:
              "Products that came back and were published again (I78). The reversibility PRD-0001 v4.1 §7.2 exists to provide, counted — a promise nobody can see kept is one somebody eventually re-implements by hand.",
            minimum: 0,
            type: "integer"
          },
          rejections: {
            description:
              "A bounded sample of the rows this run refused, with a reason for each. Bounded because a feed that rejects forty thousand rows has one problem, not forty thousand.",
            items: {
              additionalProperties: false,
              properties: {
                externalId: { type: ["string", "null"] },
                reason: { type: "string" }
              },
              required: ["externalId", "reason"],
              type: "object"
            },
            type: "array"
          },
          runId: { format: "uuid", type: "string" },
          skipped: {
            description:
              "Products the document offered that the run did not act on (I88): not carried by the platform, or carried and not live. Ordinary rather than wrong — a partner's document is their whole catalogue and the platform carries a curated part of it — which is why it is counted apart from rejections.",
            minimum: 0,
            type: "integer"
          },
          startedAt: { format: "date-time", type: "string" },
          updated: { minimum: 0, type: "integer" },
          withdrawn: {
            description:
              "Products withdrawn at the end of the Owner's 72-hour tolerance (I78). Publicly ineligible without a lifecycle change: the listing is still Published and returns the moment the source offers it again.",
            minimum: 0,
            type: "integer"
          }
        },
        required: [
          "created",
          "failureKind",
          "feedId",
          "feedName",
          "finishedAt",
          "message",
          "missing",
          "outcome",
          "read",
          "rejected",
          "rejections",
          "restored",
          "runId",
          "skipped",
          "startedAt",
          "updated",
          "withdrawn"
        ],
        type: "object"
      },
      OfferingFeedRuns: {
        additionalProperties: false,
        properties: {
          runs: {
            items: { $ref: "#/components/schemas/OfferingFeedRun" },
            type: "array"
          }
        },
        required: ["runs"],
        type: "object"
      },
      AdminOfferingFeed: {
        additionalProperties: false,
        properties: {
          active: { type: "boolean" },
          businessId: { format: "uuid", type: "string" },
          businessName: { type: "string" },
          categoryId: { format: "uuid", type: "string" },
          categoryName: { type: "string" },
          documentUrl: { type: "string" },
          feedId: { format: "uuid", type: "string" },
          format: { enum: ["XML", "JSON"], type: "string" },
          itemPath: { type: ["string", "null"] },
          lastRun: {
            anyOf: [
              { $ref: "#/components/schemas/OfferingFeedRun" },
              { type: "null" }
            ]
          },
          listingCount: { minimum: 0, type: "integer" },
          mapping: { $ref: "#/components/schemas/FeedMapping" },
          name: { type: "string" }
        },
        required: [
          "active",
          "businessId",
          "businessName",
          "categoryId",
          "categoryName",
          "documentUrl",
          "feedId",
          "format",
          "itemPath",
          "lastRun",
          "listingCount",
          "mapping",
          "name"
        ],
        type: "object"
      },
      AdminOfferingFeeds: {
        additionalProperties: false,
        properties: {
          feeds: {
            items: { $ref: "#/components/schemas/AdminOfferingFeed" },
            type: "array"
          }
        },
        required: ["feeds"],
        type: "object"
      },
      CreateOfferingFeed: {
        additionalProperties: false,
        description:
          "A partner catalogue read on a schedule. The address must parse as http or https, the Business must exist and the Category must be active. Repeating a Business and name corrects that feed rather than adding a second one pointing at the same document.",
        properties: {
          businessId: { format: "uuid", type: "string" },
          categoryId: { format: "uuid", type: "string" },
          documentUrl: { maxLength: 2048, minLength: 1, type: "string" },
          format: { enum: ["XML", "JSON"], type: "string" },
          itemPath: { maxLength: 240, type: ["string", "null"] },
          mapping: { $ref: "#/components/schemas/FeedMapping" },
          name: { maxLength: 160, minLength: 1, type: "string" }
        },
        required: [
          "businessId",
          "categoryId",
          "documentUrl",
          "format",
          "mapping",
          "name"
        ],
        type: "object"
      },
      SubmitListingReport: {
        additionalProperties: false,
        description:
          "A report about one listing (I69). No identity and no contact address: whoever the reporter is, is a fact of the request rather than something they are asked to type.",
        properties: {
          note: {
            description:
              "The person's own words, where they added any. A report is a sentence, not a document.",
            maxLength: 600,
            type: ["string", "null"]
          },
          reason: {
            description:
              "What the reader says is wrong. A closed list, because a report that was only free text is a report nobody can count.",
            enum: [
              "PRICE_WRONG",
              "STOCK_WRONG",
              "WRONG_CATEGORY",
              "MISLEADING_INFORMATION",
              "LINK_BROKEN"
            ],
            type: "string"
          }
        },
        required: ["reason"],
        type: "object"
      },
      ListingReport: {
        additionalProperties: false,
        description:
          "One report, as the Admin queue reads it. The listing is named by title, address and listing number because the queue is a working surface.",
        properties: {
          listingNumber: { pattern: "^\\d+$", type: "string" },
          note: { type: ["string", "null"] },
          offeringId: {
            description:
              "So an Admin who accepts a report can open a Moderation Case against the listing without leaving the queue or copying an identifier (I82). The slug addresses the public page; opening a case needs the id.",
            format: "uuid",
            type: "string"
          },
          offeringSlug: { type: "string" },
          offeringTitle: { type: "string" },
          reason: {
            enum: [
              "PRICE_WRONG",
              "STOCK_WRONG",
              "WRONG_CATEGORY",
              "MISLEADING_INFORMATION",
              "LINK_BROKEN"
            ],
            type: "string"
          },
          reportId: { format: "uuid", type: "string" },
          reportsForListing: {
            description:
              "How many reports this listing has open. A pattern is the fact an Admin acts on; one report rarely is.",
            minimum: 1,
            type: "integer"
          },
          status: {
            enum: ["OPEN", "ACCEPTED", "DISMISSED"],
            type: "string"
          },
          submittedAt: { format: "date-time", type: "string" }
        },
        required: [
          "listingNumber",
          "note",
          "offeringSlug",
          "offeringTitle",
          "reason",
          "reportId",
          "reportsForListing",
          "status",
          "submittedAt"
        ],
        type: "object"
      },
      ListingReports: {
        additionalProperties: false,
        properties: {
          reports: {
            items: { $ref: "#/components/schemas/ListingReport" },
            type: "array"
          },
          total: { minimum: 0, type: "integer" }
        },
        required: ["reports", "total"],
        type: "object"
      },
      ReviewListingReport: {
        additionalProperties: false,
        description:
          "Closing one report. ACCEPTED means the platform agreed there is something wrong and it is now somebody's job; DISMISSED means it looked and there was not. Neither is an action on the listing.",
        properties: {
          outcome: { enum: ["ACCEPTED", "DISMISSED"], type: "string" }
        },
        required: ["outcome"],
        type: "object"
      },
      AskDecision: {
        additionalProperties: false,
        description:
          "A question, with the priorities the person wants weighed. Priorities are carried in the person's own words and repeated; turning them into an ordering would be a forbidden ranking arriving by another route.",
        properties: {
          priorities: {
            items: { maxLength: 200, minLength: 1, type: "string" },
            maxItems: 10,
            type: "array"
          },
          question: { maxLength: 1000, minLength: 1, type: "string" }
        },
        required: ["question"],
        type: "object"
      },
      ChatTurn: {
        additionalProperties: false,
        properties: {
          askedAt: { format: "date-time", type: "string" },
          question: { type: "string" },
          reply: { type: "string" }
        },
        required: ["askedAt", "question", "reply"],
        type: "object"
      },
      DecisionChat: {
        additionalProperties: false,
        description:
          "The conversation so far, for this flow only. There is no field for an earlier conversation, a personal Decision profile or cross-decision memory, and the turns are removed when the flow expires.",
        properties: {
          decisionFlowId: { format: "uuid", type: "string" },
          turns: {
            items: { $ref: "#/components/schemas/ChatTurn" },
            type: "array"
          }
        },
        required: ["decisionFlowId", "turns"],
        type: "object"
      },
      DecisionContext: {
        additionalProperties: false,
        description:
          "The current Decision Context: exactly one eligible Offering or one Comparison Set, never both. `valid` is separate from the contents because a context can be well-formed and still unusable — the Offering may have been retired, or the set may have fallen below two members. Decision Chat and every handoff action are unavailable while it is invalid. There is no field for a previous decision, a saved context or anything the person did before.",
        properties: {
          affiliateAvailable: {
            description:
              "Whether the Affiliate path may be offered right now: a valid context, a current eligible Selected Offering, and an eligible Affiliate Destination. A boolean and not a destination — the address is read inside the initiation and never before, so an unavailable path cannot expose where it would have led and neither can an available one.",
            type: "boolean"
          },
          comparison: {
            oneOf: [
              { $ref: "#/components/schemas/ComparisonSet" },
              { type: "null" }
            ]
          },
          decisionFlowId: { format: "uuid", type: "string" },
          handoffAvailable: {
            description:
              "Whether a handoff may be offered at all. True only where the context is valid and a current eligible Selected Offering exists — a valid context with nothing selected offers nothing.",
            type: "boolean"
          },
          invalidity: {
            enum: ["OFFERING_INELIGIBLE", "SET_NOT_VALID", null],
            type: ["string", "null"]
          },
          offering: {
            oneOf: [
              { $ref: "#/components/schemas/ListingCard" },
              { type: "null" }
            ]
          },
          repairs: {
            description:
              "A closed list. Repairing the set is offered only where there is a set to repair.",
            items: {
              enum: [
                "REPAIR_COMPARISON_SET",
                "CHOOSE_ANOTHER_OFFERING",
                "LEAVE_DECISION"
              ],
              type: "string"
            },
            type: "array"
          },
          selected: {
            description:
              "The explicitly Selected Offering, or nothing. Null is the ordinary starting state and the state a cleared selection returns to.",
            oneOf: [
              { $ref: "#/components/schemas/ListingCard" },
              { type: "null" }
            ]
          },
          selectionLost: {
            description:
              "Whether a selection was made and has stopped being usable. `selected` alone cannot say this: nothing chosen yet and something chosen that fell away both read as null. It says nothing about Completion — a selection falling away produces none.",
            type: "boolean"
          },
          valid: { type: "boolean" }
        },
        required: [
          "affiliateAvailable",
          "comparison",
          "decisionFlowId",
          "handoffAvailable",
          "invalidity",
          "offering",
          "repairs",
          "selected",
          "selectionLost",
          "valid"
        ],
        type: "object"
      },
      DecisionCompletions: {
        additionalProperties: false,
        description:
          "The two Decision Completions, kept apart. Each is present only where its own evidence exists — an initiated Affiliate Handoff, or a revealed Direct Contact channel. There is deliberately no combined completed flag: the two are different ends to a journey and are counted separately. Completion means the platform's V1 Decision-support responsibility ended; it claims no purchase, sale, booking, contract, application, call, email, reply, response or external service result, and no field here could express one. Nothing is written to produce it and no further confirmation is asked for.",
        properties: {
          affiliateHandoff: {
            oneOf: [
              {
                additionalProperties: false,
                properties: {
                  completedAt: { format: "date-time", type: "string" },
                  offeringId: { format: "uuid", type: "string" }
                },
                required: ["completedAt", "offeringId"],
                type: "object"
              },
              { type: "null" }
            ]
          },
          decisionFlowId: { format: "uuid", type: "string" },
          directContact: {
            oneOf: [
              {
                additionalProperties: false,
                properties: {
                  channel: {
                    enum: ["TELEPHONE", "EMAIL", "URL"],
                    type: "string"
                  },
                  completedAt: { format: "date-time", type: "string" },
                  offeringId: { format: "uuid", type: "string" }
                },
                required: ["channel", "completedAt", "offeringId"],
                type: "object"
              },
              { type: "null" }
            ]
          }
        },
        required: ["affiliateHandoff", "decisionFlowId", "directContact"],
        type: "object"
      },
      ContactChannels: {
        additionalProperties: false,
        description:
          "Which Direct Contact channels the owning Business supplied, without revealing any of them. Public: knowing that a telephone number exists is not being told it, and the choice among several has to be offerable before anything is revealed. `revealable` is false for a Guest and false while the Selected Offering is not currently eligible.",
        properties: {
          available: {
            items: { enum: ["TELEPHONE", "EMAIL", "URL"], type: "string" },
            type: "array"
          },
          revealable: { type: "boolean" }
        },
        required: ["available", "revealable"],
        type: "object"
      },
      RevealContact: {
        additionalProperties: false,
        description:
          "The person names the channel they want. Required even where only one is available, because what is revealed is what was explicitly chosen.",
        properties: {
          channel: { enum: ["TELEPHONE", "EMAIL", "URL"], type: "string" }
        },
        required: ["channel"],
        type: "object"
      },
      DirectContactReveal: {
        additionalProperties: false,
        description:
          "A successful reveal, which Decision Completion consumes. The revealed value, the channel it belongs to, and nothing else — no message, inbox, conversation, reply, delivery, answer, Business-response state or external-success confirmation can be expressed here.",
        properties: {
          channel: { enum: ["TELEPHONE", "EMAIL", "URL"], type: "string" },
          offeringId: { format: "uuid", type: "string" },
          revealedAt: { format: "date-time", type: "string" },
          value: { type: "string" }
        },
        required: ["channel", "offeringId", "revealedAt", "value"],
        type: "object"
      },
      AffiliateHandoff: {
        additionalProperties: false,
        description:
          "A successful Affiliate Handoff initiation, which Decision Completion consumes. It says where the person is being sent and that the platform made it active; it carries no claim about what happens there, and has no field in which one could be made.",
        properties: {
          destination: { type: "string" },
          initiatedAt: { format: "date-time", type: "string" },
          offeringId: { format: "uuid", type: "string" }
        },
        required: ["destination", "initiatedAt", "offeringId"],
        type: "object"
      },
      SelectOffering: {
        additionalProperties: false,
        description:
          "Selecting is explicit, and so is clearing: `offeringId: null` is the person saying none of these yet rather than an omission.",
        properties: {
          offeringId: { format: "uuid", type: ["string", "null"] }
        },
        required: ["offeringId"],
        type: "object"
      },
      EnterDecision: {
        description:
          "Exactly one eligible Offering or one valid Comparison Set. A union rather than two optional fields, so a request asking to decide about two unrelated things cannot be expressed.",
        oneOf: [
          {
            additionalProperties: false,
            properties: { offeringId: { format: "uuid", type: "string" } },
            required: ["offeringId"],
            type: "object"
          },
          {
            additionalProperties: false,
            properties: { comparisonSetId: { format: "uuid", type: "string" } },
            required: ["comparisonSetId"],
            type: "object"
          }
        ]
      },
      ComparisonSet: {
        additionalProperties: false,
        description:
          "A Comparison Set as it is being built. `openable` states the two-member floor and `full` the five-member ceiling, so a surface offering the next action does not have to know the numbers.",
        properties: {
          categoryId: { format: "uuid", type: "string" },
          categoryName: { type: "string" },
          comparisonSetId: { format: "uuid", type: "string" },
          full: { type: "boolean" },
          members: {
            items: { $ref: "#/components/schemas/ListingCard" },
            type: "array"
          },
          openable: { type: "boolean" }
        },
        required: [
          "categoryId",
          "categoryName",
          "comparisonSetId",
          "full",
          "members",
          "openable"
        ],
        type: "object"
      },
      ComparisonRow: {
        additionalProperties: false,
        description:
          "One comparable Attribute across the members. `values` is positional and matches the member order; `null` means the Offering supplied no value, and the phrase a person reads for that is UX's. There is no not-applicable entry and no shape for one: every member shares one active leaf Category, so every comparable Attribute applies to all of them.",
        properties: {
          attributeId: { format: "uuid", type: "string" },
          kind: {
            enum: [
              "TEXT",
              "NUMBER",
              "BOOLEAN",
              "SINGLE_SELECT",
              "MULTI_SELECT"
            ],
            type: "string"
          },
          name: { type: "string" },
          unit: { type: ["string", "null"] },
          values: {
            items: {
              oneOf: [
                {
                  additionalProperties: false,
                  properties: {
                    boolean: { type: ["boolean", "null"] },
                    number: { type: ["number", "null"] },
                    offeringId: { format: "uuid", type: "string" },
                    optionLabels: { items: { type: "string" }, type: "array" },
                    text: { type: ["string", "null"] }
                  },
                  required: [
                    "boolean",
                    "number",
                    "offeringId",
                    "optionLabels",
                    "text"
                  ],
                  type: "object"
                },
                { type: "null" }
              ]
            },
            type: "array"
          }
        },
        required: ["attributeId", "kind", "name", "unit", "values"],
        type: "object"
      },
      ComparisonView: {
        additionalProperties: false,
        description:
          "Compare itself. Nothing ranks, scores, normalises or recommends, and no field could express a winner.",
        properties: {
          categoryId: { format: "uuid", type: "string" },
          categoryName: { type: "string" },
          comparisonSetId: { format: "uuid", type: "string" },
          full: { type: "boolean" },
          members: {
            items: { $ref: "#/components/schemas/ListingCard" },
            type: "array"
          },
          openable: { type: "boolean" },
          rows: {
            items: { $ref: "#/components/schemas/ComparisonRow" },
            type: "array"
          }
        },
        required: [
          "categoryId",
          "categoryName",
          "comparisonSetId",
          "full",
          "members",
          "openable",
          "rows"
        ],
        type: "object"
      },
      AddComparisonMember: {
        additionalProperties: false,
        description:
          "`replaces` is required in effect at five members: the person names what leaves as well as what arrives, because nothing infers a victim.",
        properties: {
          offeringId: { format: "uuid", type: "string" },
          replaces: { format: "uuid", type: "string" }
        },
        required: ["offeringId"],
        type: "object"
      },
      PresentedAttribute: {
        additionalProperties: false,
        description:
          "One Attribute as Presentation shows it. The governed unit and the option labels travel with the value, because the value alone does not mean anything. `supplied` distinguishes a missing optional value from a value that happens to be false or zero.",
        properties: {
          attributeId: { format: "uuid", type: "string" },
          boolean: { type: ["boolean", "null"] },
          kind: {
            enum: [
              "TEXT",
              "NUMBER",
              "BOOLEAN",
              "SINGLE_SELECT",
              "MULTI_SELECT"
            ],
            type: "string"
          },
          name: { type: "string" },
          number: { type: ["number", "null"] },
          optionLabels: { items: { type: "string" }, type: "array" },
          supplied: { type: "boolean" },
          text: { type: ["string", "null"] },
          unit: { type: ["string", "null"] }
        },
        required: [
          "attributeId",
          "boolean",
          "kind",
          "name",
          "number",
          "optionLabels",
          "supplied",
          "text",
          "unit"
        ],
        type: "object"
      },
      SellerOffer: {
        additionalProperties: false,
        description:
          "One seller's row in the price list. The Business name and its price, and deliberately nothing else — no seller rating and no authorised-dealer mark, both of which PRD-0001 v4.0 §4 puts out of scope.",
        properties: {
          businessName: { type: "string" },
          offeringId: { format: "uuid", type: "string" },
          pricing: { $ref: "#/components/schemas/OfferingPrice" },
          slug: { type: "string" }
        },
        required: ["businessName", "offeringId", "pricing", "slug"],
        type: "object"
      },
      OfferingPresentation: {
        additionalProperties: false,
        description:
          "The PRD-0001 §8.2 product minimum for complete public Presentation. It carries no telephone, email, external contact URL or Affiliate Destination — the public Business identity set is exactly the three fields PRD-0005 owns. `visuals` carries the supplied set in the order it is inspected in, the first entry being the primary visual. An empty array means the Offering supplied none, rather than media not being part of the minimum.",
        properties: {
          attributes: {
            items: { $ref: "#/components/schemas/PresentedAttribute" },
            type: "array"
          },
          business: { $ref: "#/components/schemas/PublicBusinessIdentity" },
          categoryPath: {
            description: "Root first. The Category context is the path.",
            items: { type: "string" },
            minItems: 1,
            type: "array"
          },
          description: { type: ["string", "null"] },
          listingNumber: {
            description:
              "The listing number a person reads, quotes and types (I67). Digits, as a string: it is an identifier rather than a quantity, and a number long enough to be unique is a number a JSON reader may round. Surfaces print it with the `\u0130LN-` prefix; typing it into Search returns that listing.",
            pattern: "^\\d+$",
            type: "string"
          },
          offeringId: { format: "uuid", type: "string" },
          pricing: { $ref: "#/components/schemas/OfferingPrice" },
          productKey: { type: ["string", "null"] },
          publishedAt: { format: "date-time", type: "string" },
          rating: { $ref: "#/components/schemas/ProductRating" },
          sellers: {
            description:
              "Every publicly eligible Offering carrying the same Product Key, cheapest first, including this one. Never empty: an Offering with no key is the only seller of itself.",
            items: { $ref: "#/components/schemas/SellerOffer" },
            minItems: 1,
            type: "array"
          },
          slug: { type: "string" },
          title: { type: "string" },
          visuals: { items: { type: "string" }, type: "array" }
        },
        required: [
          "attributes",
          "business",
          "categoryPath",
          "description",
          "listingNumber",
          "offeringId",
          "pricing",
          "productKey",
          "publishedAt",
          "rating",
          "sellers",
          "slug",
          "title",
          "visuals"
        ],
        type: "object"
      },
      PriceConstraint: {
        additionalProperties: false,
        description:
          "A Price Constraint (PRD-0002 v2.5 §10.6, `US-DSC-F11-001`): an inclusive upper bound, an inclusive lower bound, or both, on the amount a person would pay — the amount together with a stated delivery cost, as PRD-0001 §5.10.5 defines it. At least one bound is required. Amounts are decimal strings, never floats, because an inclusive boundary that a person types exactly has to be met exactly. `currency` is required and never defaulted: §10.6.2 refuses to convert between currencies, so an Offering in another currency is outside the constraint rather than converted into it. An Offering whose Pricing Kind is not FIXED does not satisfy a constraint at all. A lower bound above an upper one is valid, is satisfied by nothing, and is not reversed.",
        properties: {
          currency: { maxLength: 3, minLength: 3, type: "string" },
          maxAmount: { type: ["string", "null"] },
          minAmount: { type: ["string", "null"] }
        },
        required: ["currency"],
        type: "object"
      },
      ProductReview: {
        additionalProperties: false,
        description:
          'One review, as a public reader sees it (I62). The byline is a masking rule rather than a stored value: the account holds the name the person typed and the API publishes "Aylin K." — given name, surname initial — because that is enough to tell two reviewers apart and the full surname is not needed to make a review credible. `null` where the account has no name at all: an anonymous review is honest, an invented byline is not. `body` is nullable because a score with no words is a complete review.',
        properties: {
          author: { type: ["string", "null"] },
          body: { type: ["string", "null"] },
          mine: { type: "boolean" },
          rating: { maximum: 5, minimum: 1, type: "integer" },
          reviewId: { format: "uuid", type: "string" },
          writtenAt: { format: "date-time", type: "string" }
        },
        required: ["author", "body", "mine", "rating", "reviewId", "writtenAt"],
        type: "object"
      },
      ProductReviews: {
        additionalProperties: false,
        description:
          "The reviews of one product, newest first, with the aggregate they produce. The average travels with the page rather than being left for the caller to compute, because the page is a page and the average is over all of them — a surface that averaged what it received would publish a different number on page two. `writable` is a fact about the request rather than about the product: an anonymous reader gets `false` and a sign-in prompt, not a form that fails on submit.",
        properties: {
          rating: { $ref: "#/components/schemas/ProductRating" },
          reviews: {
            items: { $ref: "#/components/schemas/ProductReview" },
            type: "array"
          },
          total: { minimum: 0, type: "integer" },
          writable: { type: "boolean" }
        },
        required: ["rating", "reviews", "total", "writable"],
        type: "object"
      },
      WriteProductReview: {
        additionalProperties: false,
        description:
          "Writing or replacing one's own review (I62). A repeat submission replaces the previous one rather than adding a second vote — one person, one opinion about one product — which is what keeps the average an average of people.",
        properties: {
          body: { maxLength: 2000, minLength: 1, type: ["string", "null"] },
          rating: { maximum: 5, minimum: 1, type: "integer" }
        },
        required: ["rating"],
        type: "object"
      },
      RatingConstraint: {
        additionalProperties: false,
        description:
          "A Rating Constraint (I62): the lowest product score a person will consider. Like the Price Constraint and unlike an Attribute Filter, it is not a Filter — a rating is an aggregate over the reviews of a product group rather than a property of an Offering — so it travels as its own field. A number rather than a decimal string, because half a star is exactly representable and no arithmetic is done on it. Absent means all ratings; a product nobody has scored satisfies no constraint, because a product with no score cannot answer a question about its score.",
        properties: {
          minimum: { maximum: 5, minimum: 0.5, multipleOf: 0.5, type: "number" }
        },
        required: ["minimum"],
        type: "object"
      },
      SearchSubmission: {
        additionalProperties: false,
        properties: {
          arrangement: {
            description:
              "Which of the four arrangements the Results are in (I68): DEFAULT (Tümü) is the ordinary arrangement — out of stock last, then cheapest delivered first; NEWEST (En yeni) is later Initial Published At first; RISING (Yükselenler) averages opens, Affiliate Handoffs and reviews over the last thirty days; POPULAR (Popüler) counts opens over the same window. A closed platform-defined set, never a caller-composed sort: PRD-0002 §12.5's exclusions of paid placement, sponsored priority, promoted cards and Business-controlled ranking are untouched.",
            enum: ["DEFAULT", "NEWEST", "RISING", "POPULAR"],
            type: "string"
          },
          categoryId: {
            description:
              "Narrows the current Search to one active leaf Category. Part of the same Search, not a new path — no Browse Discovery Start is created.",
            format: "uuid",
            type: ["string", "null"]
          },
          discoveryPathId: { format: "uuid", type: "string" },
          filters: {
            description:
              "Applicable only inside one active leaf Category, so supplying these without categoryId is a contradiction rather than a default.",
            items: { $ref: "#/components/schemas/AppliedFilter" },
            maxItems: 50,
            type: "array"
          },
          price: {
            anyOf: [
              { $ref: "#/components/schemas/PriceConstraint" },
              { type: "null" }
            ],
            description:
              "Unlike `filters`, valid with or without `categoryId`: §10.6.1 offers the Price Constraint wherever Results are, because an amount belongs to the Offering rather than to a Category."
          },
          inStockOnly: {
            description:
              "I64. Only Offerings a seller has stated are available. An Unknown stock level does not satisfy it — PRD-0002 §10.4: an Offering with no value for an applied criterion does not satisfy it — which is deliberately the opposite of the ordering's treatment of Unknown, where absence of a claim is not a claim of absence.",
            type: "boolean"
          },
          page: {
            description:
              "I63. Which page of the ordered results to return, one-based. Defaults to the first.",
            maximum: 400,
            minimum: 1,
            type: "integer"
          },
          query: { maxLength: 400, minLength: 1, type: "string" },
          rating: {
            anyOf: [
              { $ref: "#/components/schemas/RatingConstraint" },
              { type: "null" }
            ],
            description:
              "I62. Like `price` and unlike `filters`, valid with or without `categoryId`: a product score is a fact about the product, so the floor applies before a leaf is chosen."
          }
        },
        required: ["query"],
        type: "object"
      },
      SearchResult: {
        additionalProperties: false,
        properties: {
          businessName: { type: "string" },
          categoryName: { type: "string" },
          handoffAvailable: {
            description:
              "Whether this result may offer an Affiliate Handoff (`US-DSC-F06-001` v1.1 AC-9). The same boolean the Listing Card carries, for the same reason: Search and Browse compose the card in two queries, and a control offered in one surface and not the other would be one platform behaving as two.",
            type: "boolean"
          },
          matchLevel: {
            description:
              "The highest applicable relationship of PRD-0002 §12.2. A level, not a score: ordering consumes it, and no ranking algorithm is defined.",
            enum: [
              "TITLE",
              "CATEGORY_PATH",
              "BUSINESS_NAME",
              "DESCRIPTION_OR_ATTRIBUTE"
            ],
            type: "string"
          },
          listingNumber: {
            description:
              "The listing number a person reads, quotes and types (I67). Digits, as a string: it is an identifier rather than a quantity, and a number long enough to be unique is a number a JSON reader may round. Surfaces print it with the `\u0130LN-` prefix; typing it into Search returns that listing.",
            pattern: "^\\d+$",
            type: "string"
          },
          offeringId: { format: "uuid", type: "string" },
          pricing: { $ref: "#/components/schemas/OfferingPrice" },
          productKey: { type: ["string", "null"] },
          sellerCount: { minimum: 1, type: "integer" },
          primaryVisualUrl: {
            description:
              "The Listing Card's one visual, or null. `null` rather than an empty string: a card carries one visual or none, and the two are different answers. The rest of the set belongs to Presentation, which is why this is not an array.",
            type: ["string", "null"]
          },
          publishedAt: { format: "date-time", type: "string" },
          rating: { $ref: "#/components/schemas/ProductRating" },
          slug: { type: "string" },
          title: { type: "string" }
        },
        required: [
          "businessName",
          "categoryName",
          "handoffAvailable",
          "matchLevel",
          "listingNumber",
          "offeringId",
          "pricing",
          "primaryVisualUrl",
          "productKey",
          "publishedAt",
          "rating",
          "sellerCount",
          "slug",
          "title"
        ],
        type: "object"
      },
      SearchView: {
        additionalProperties: false,
        properties: {
          arrangement: {
            description:
              "Which of the four arrangements the Results are in (I68): DEFAULT (Tümü) is the ordinary arrangement — out of stock last, then cheapest delivered first; NEWEST (En yeni) is later Initial Published At first; RISING (Yükselenler) averages opens, Affiliate Handoffs and reviews over the last thirty days; POPULAR (Popüler) counts opens over the same window. A closed platform-defined set, never a caller-composed sort: PRD-0002 §12.5's exclusions of paid placement, sponsored priority, promoted cards and Business-controlled ranking are untouched.",
            enum: ["DEFAULT", "NEWEST", "RISING", "POPULAR"],
            type: "string"
          },
          categoryId: {
            description: "The active leaf Category the Search is narrowed to.",
            format: "uuid",
            type: ["string", "null"]
          },
          discoveryPathId: { format: "uuid", type: "string" },
          domain: {
            ...DOMAIN_KEY,
            description:
              "The Domain's stable key, available once one active leaf Category is selected. A Search that spans Domains has none.",
            type: ["string", "null"]
          },
          domainName: {
            ...DOMAIN_NAME,
            description: "The Domain's own name. Null exactly when the key is.",
            type: ["string", "null"]
          },
          filters: {
            description:
              "The Filters that may be applied here. Empty until a leaf is selected.",
            items: { $ref: "#/components/schemas/AvailableFilter" },
            type: "array"
          },
          filtersAvailable: {
            description:
              "Whether category-specific Attribute Filters may be offered. True only once one active leaf Category is selected.",
            type: "boolean"
          },
          narrowing: {
            description:
              "The active leaf Categories this query reaches, offered when it reaches more than one. Computed from the unnarrowed candidate set, so narrowing never hides the alternatives.",
            items: { $ref: "#/components/schemas/BrowseCategory" },
            type: "array"
          },
          paging: {
            $ref: "#/components/schemas/Paging",
            description:
              "I63. Never null here: a Search always answers with a list, even an empty one."
          },
          query: {
            description:
              "The exact submitted query, retained as visible Discovery criteria.",
            type: "string"
          },
          results: {
            items: { $ref: "#/components/schemas/SearchResult" },
            type: "array"
          },
          zeroResults: {
            description: "Present only when nothing matched.",
            oneOf: [
              { $ref: "#/components/schemas/ZeroResults" },
              { type: "null" }
            ]
          }
        },
        required: [
          "arrangement",
          "categoryId",
          "discoveryPathId",
          "domain",
          "domainName",
          "filters",
          "filtersAvailable",
          "narrowing",
          "paging",
          "query",
          "results",
          "zeroResults"
        ],
        type: "object"
      },
      BrowseRoots: {
        additionalProperties: false,
        properties: {
          domains: {
            items: {
              additionalProperties: false,
              properties: {
                categories: {
                  items: { $ref: "#/components/schemas/BrowseCategory" },
                  type: "array"
                },
                domain: DOMAIN_KEY,
                domainName: DOMAIN_NAME
              },
              required: ["categories", "domain", "domainName"],
              type: "object"
            },
            type: "array"
          }
        },
        required: ["domains"],
        type: "object"
      },
      BrowseSelection: {
        additionalProperties: false,
        description:
          "A path already being followed. Absent on the first selection, which is what makes that selection the start of a new path.",
        properties: {
          arrangement: {
            description:
              "Which of the four arrangements the Results are in (I68): DEFAULT (Tümü) is the ordinary arrangement — out of stock last, then cheapest delivered first; NEWEST (En yeni) is later Initial Published At first; RISING (Yükselenler) averages opens, Affiliate Handoffs and reviews over the last thirty days; POPULAR (Popüler) counts opens over the same window. A closed platform-defined set, never a caller-composed sort: PRD-0002 §12.5's exclusions of paid placement, sponsored priority, promoted cards and Business-controlled ranking are untouched.",
            enum: ["DEFAULT", "NEWEST", "RISING", "POPULAR"],
            type: "string"
          },
          discoveryPathId: { format: "uuid", type: "string" },
          filters: {
            items: { $ref: "#/components/schemas/AppliedFilter" },
            maxItems: 50,
            type: "array"
          },
          price: {
            anyOf: [
              { $ref: "#/components/schemas/PriceConstraint" },
              { type: "null" }
            ],
            description:
              "Offered on a branch as well as a leaf, where the Attribute Filters above are not."
          },
          inStockOnly: {
            description:
              "I64. Only Offerings a seller has stated are available. An Unknown stock level does not satisfy it (PRD-0002 §10.4).",
            type: "boolean"
          },
          page: {
            description:
              "I63. Which page of the ordered results to return, one-based. A branch withholds Results entirely, so the number is simply unused there.",
            maximum: 400,
            minimum: 1,
            type: "integer"
          },
          rating: {
            anyOf: [
              { $ref: "#/components/schemas/RatingConstraint" },
              { type: "null" }
            ],
            description:
              "I62, on the same terms as `price`: a product score is a fact about the product, so the criterion travels wherever products are listed."
          }
        },
        type: "object"
      },
      BrowseView: {
        additionalProperties: false,
        properties: {
          arrangement: {
            description:
              "Which of the four arrangements the Results are in (I68): DEFAULT (Tümü) is the ordinary arrangement — out of stock last, then cheapest delivered first; NEWEST (En yeni) is later Initial Published At first; RISING (Yükselenler) averages opens, Affiliate Handoffs and reviews over the last thirty days; POPULAR (Popüler) counts opens over the same window. A closed platform-defined set, never a caller-composed sort: PRD-0002 §12.5's exclusions of paid placement, sponsored priority, promoted cards and Business-controlled ranking are untouched.",
            enum: ["DEFAULT", "NEWEST", "RISING", "POPULAR"],
            type: "string"
          },
          ancestors: {
            items: { $ref: "#/components/schemas/BrowseCategory" },
            type: "array"
          },
          category: { $ref: "#/components/schemas/BrowseCategory" },
          children: {
            items: { $ref: "#/components/schemas/BrowseCategory" },
            type: "array"
          },
          discoveryPathId: { format: "uuid", type: "string" },
          domain: DOMAIN_KEY,
          domainName: DOMAIN_NAME,
          filters: {
            description:
              "Offered on a leaf; empty on a branch, where no active leaf Category is selected.",
            items: { $ref: "#/components/schemas/AvailableFilter" },
            type: "array"
          },
          paging: {
            description:
              "I63. Where the person is in the list and how long it is — null exactly where `results` is, because a branch withheld the list and there is no position in one.",
            oneOf: [{ $ref: "#/components/schemas/Paging" }, { type: "null" }]
          },
          results: {
            description:
              "Null for a non-leaf Category: Results are withheld, which is a different statement from there being none. A parent never aggregates its descendants' Offerings.",
            items: { $ref: "#/components/schemas/ListingCard" },
            type: ["array", "null"]
          },
          siblings: {
            items: { $ref: "#/components/schemas/BrowseCategory" },
            type: "array"
          },
          zeroResults: {
            description: "Present only when a leaf matched nothing.",
            oneOf: [
              { $ref: "#/components/schemas/ZeroResults" },
              { type: "null" }
            ]
          }
        },
        required: [
          "arrangement",
          "ancestors",
          "category",
          "children",
          "discoveryPathId",
          "domain",
          "domainName",
          "filters",
          "paging",
          "results",
          "siblings",
          "zeroResults"
        ],
        type: "object"
      },
      Category: {
        additionalProperties: false,
        properties: {
          active: { type: "boolean" },
          domain: DOMAIN_KEY,
          domainName: DOMAIN_NAME,
          id: { format: "uuid", type: "string" },
          name: { type: "string" },
          parentId: { format: "uuid", type: ["string", "null"] },
          slug: { type: "string" },
          stableKey: { type: "string" }
        },
        required: [
          "active",
          "domain",
          "domainName",
          "id",
          "name",
          "parentId",
          "slug",
          "stableKey"
        ],
        type: "object"
      },
      Categories: {
        additionalProperties: false,
        properties: {
          categories: {
            items: { $ref: "#/components/schemas/Category" },
            type: "array"
          },
          /*
           * The Domains travel with the Categories because the create-root form
           * has to offer a choice, and the set is open (PRD-0001 v4.0 §E): a
           * list held in the Admin interface would be a second owner of
           * membership and would be wrong the moment a Domain is added.
           */
          domains: {
            items: {
              additionalProperties: false,
              properties: { key: DOMAIN_KEY, name: DOMAIN_NAME },
              required: ["key", "name"],
              type: "object"
            },
            type: "array"
          }
        },
        required: ["categories", "domains"],
        type: "object"
      },
      AssignableCategories: {
        additionalProperties: false,
        description:
          "Every Category an Offering may be assigned to right now: active, with no active child. The same predicate creation enforces, asked as a question — so a Category listed here is one creation would accept.",
        properties: {
          categories: {
            items: {
              additionalProperties: false,
              properties: {
                domain: DOMAIN_KEY,
                domainName: DOMAIN_NAME,
                id: { format: "uuid", type: "string" },
                name: { type: "string" },
                path: {
                  description:
                    "The whole ancestry, root first. Two Categories may share a leaf name in different parts of the catalogue.",
                  items: { type: "string" },
                  type: "array"
                }
              },
              required: ["domain", "domainName", "id", "name", "path"],
              type: "object"
            },
            type: "array"
          }
        },
        required: ["categories"],
        type: "object"
      },
      CreateCategory: {
        description:
          "A root Category names one V1 Domain; a child names one parent and inherits the Domain. Exactly one of the two forms is accepted.",
        oneOf: [
          {
            additionalProperties: false,
            properties: {
              domain: DOMAIN_KEY,
              name: { maxLength: 160, minLength: 1, type: "string" },
              slug: {
                maxLength: 120,
                minLength: 1,
                pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                type: "string"
              },
              stableKey: {
                maxLength: 100,
                minLength: 1,
                pattern: "^[A-Z0-9]+(?:_[A-Z0-9]+)*$",
                type: "string"
              }
            },
            required: ["domain", "name", "slug", "stableKey"],
            type: "object"
          },
          {
            additionalProperties: false,
            properties: {
              name: { maxLength: 160, minLength: 1, type: "string" },
              parentId: { format: "uuid", type: "string" },
              slug: {
                maxLength: 120,
                minLength: 1,
                pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                type: "string"
              },
              stableKey: {
                maxLength: 100,
                minLength: 1,
                pattern: "^[A-Z0-9]+(?:_[A-Z0-9]+)*$",
                type: "string"
              }
            },
            required: ["name", "parentId", "slug", "stableKey"],
            type: "object"
          }
        ]
      },
      RenameCategory: {
        additionalProperties: false,
        properties: {
          name: { maxLength: 160, minLength: 1, type: "string" }
        },
        required: ["name"],
        type: "object"
      },
      ReparentCategory: {
        additionalProperties: false,
        properties: {
          parentId: { format: "uuid", type: ["string", "null"] }
        },
        required: ["parentId"],
        type: "object"
      },
      OfferingAttributeValueInput: {
        description:
          "Discriminated by kind so a request states what it means and the server can check it against what the Attribute declares. SELECT carries a list because a Multi Select is several choices.",
        oneOf: [
          {
            additionalProperties: false,
            properties: {
              attributeId: { format: "uuid", type: "string" },
              kind: { enum: ["TEXT"], type: "string" },
              text: { maxLength: 4000, minLength: 1, type: "string" }
            },
            required: ["attributeId", "kind", "text"],
            type: "object"
          },
          {
            additionalProperties: false,
            properties: {
              attributeId: { format: "uuid", type: "string" },
              kind: { enum: ["NUMBER"], type: "string" },
              number: { type: "number" }
            },
            required: ["attributeId", "kind", "number"],
            type: "object"
          },
          {
            additionalProperties: false,
            properties: {
              attributeId: { format: "uuid", type: "string" },
              boolean: { type: "boolean" },
              kind: { enum: ["BOOLEAN"], type: "string" }
            },
            required: ["attributeId", "boolean", "kind"],
            type: "object"
          },
          {
            additionalProperties: false,
            properties: {
              attributeId: { format: "uuid", type: "string" },
              kind: { enum: ["SELECT"], type: "string" },
              optionIds: {
                items: { format: "uuid", type: "string" },
                maxItems: 100,
                minItems: 1,
                type: "array"
              }
            },
            required: ["attributeId", "kind", "optionIds"],
            type: "object"
          }
        ]
      },
      OfferingPriceInput: {
        description:
          "What a submission may say about price. The Kind is the fact and the amount is a detail: `ON_REQUEST` means the Offering has no amount by its nature and its cost is settled after the Handoff, while `UNKNOWN` means the platform does not know yet. These are different answers and a single nullable amount would conflate them. Only `FIXED` carries money. `amountSetAt` is absent by design — the instant an amount was established is stamped where it is written, so a caller cannot present a stale amount as current.",
        discriminator: { propertyName: "kind" },
        oneOf: [
          {
            additionalProperties: false,
            properties: {
              amount: {
                description:
                  "Decimal text, not a number. `NUMERIC(12,2)` is exact and IEEE-754 is not, and the ordering of these amounts is what a comparison offers.",
                pattern: "^(?:0|[1-9]\\d{0,9})(?:\\.\\d{1,2})?$",
                type: "string"
              },
              currency: {
                description: "ISO 4217 alphabetic.",
                pattern: "^[A-Z]{3}$",
                type: "string"
              },
              deliveryCost: {
                description:
                  "`0` is free delivery and `null` is not stated. Included in the amount a person would pay, which is what price ordering uses.",
                pattern: "^(?:0|[1-9]\\d{0,9})(?:\\.\\d{1,2})?$",
                type: ["string", "null"]
              },
              kind: { enum: ["FIXED"], type: "string" },
              priorAmount: {
                description:
                  "Refused unless it exceeds `amount`. A prior amount at or below the current one describes no reduction.",
                pattern: "^(?:0|[1-9]\\d{0,9})(?:\\.\\d{1,2})?$",
                type: ["string", "null"]
              },
              stockState: {
                enum: ["IN_STOCK", "OUT_OF_STOCK", "UNKNOWN"],
                type: "string"
              }
            },
            required: ["amount", "currency", "kind"],
            type: "object"
          },
          {
            additionalProperties: false,
            properties: {
              kind: { enum: ["ON_REQUEST"], type: "string" },
              stockState: {
                enum: ["IN_STOCK", "OUT_OF_STOCK", "UNKNOWN"],
                type: "string"
              }
            },
            required: ["kind"],
            type: "object"
          },
          {
            additionalProperties: false,
            properties: {
              kind: { enum: ["UNKNOWN"], type: "string" },
              stockState: {
                enum: ["IN_STOCK", "OUT_OF_STOCK", "UNKNOWN"],
                type: "string"
              }
            },
            required: ["kind"],
            type: "object"
          }
        ]
      },
      OfferingPrice: {
        description:
          "The Offering's price as it is read back. A Fixed price always carries the instant it was established: a price without one is a claim about the present the platform cannot keep.",
        discriminator: { propertyName: "kind" },
        oneOf: [
          {
            additionalProperties: false,
            properties: {
              amount: { type: "string" },
              amountSetAt: { format: "date-time", type: "string" },
              currency: { type: "string" },
              deliveryCost: { type: ["string", "null"] },
              kind: { enum: ["FIXED"], type: "string" },
              priorAmount: { type: ["string", "null"] },
              stockState: {
                enum: ["IN_STOCK", "OUT_OF_STOCK", "UNKNOWN"],
                type: "string"
              }
            },
            required: [
              "amount",
              "amountSetAt",
              "currency",
              "deliveryCost",
              "kind",
              "priorAmount",
              "stockState"
            ],
            type: "object"
          },
          {
            additionalProperties: false,
            properties: {
              kind: { enum: ["ON_REQUEST"], type: "string" },
              stockState: {
                enum: ["IN_STOCK", "OUT_OF_STOCK", "UNKNOWN"],
                type: "string"
              }
            },
            required: ["kind", "stockState"],
            type: "object"
          },
          {
            additionalProperties: false,
            properties: {
              kind: { enum: ["UNKNOWN"], type: "string" },
              stockState: {
                enum: ["IN_STOCK", "OUT_OF_STOCK", "UNKNOWN"],
                type: "string"
              }
            },
            required: ["kind", "stockState"],
            type: "object"
          }
        ]
      },
      EditOffering: {
        additionalProperties: false,
        description:
          "Replaces the Offering's content. An Attribute left out is one the Offering no longer holds a value for. There is no lifecycle field: a saved edit publishes, retires, hides and restores nothing. There is no Source field either: how a record came to exist is a property of the path that wrote it, not a claim a body may make.",
        properties: {
          attributes: {
            items: { $ref: "#/components/schemas/OfferingAttributeValueInput" },
            maxItems: 200,
            type: "array"
          },
          categoryId: { format: "uuid", type: "string" },
          pricing: {
            allOf: [{ $ref: "#/components/schemas/OfferingPriceInput" }],
            description:
              "Absent means the Offering states no price, because this shape is a replacement. Harmless: no Pricing Kind blocks publication, so clearing a price never withdraws an Offering."
          },
          productKey: {
            description:
              "A value identifying the product this Offering is an instance of, where one exists and is known. Offerings sharing a key may be presented together. It creates no Product entity, and Offerings are grouped only when their keys are equal — similar titles and prices are not evidence.",
            maxLength: 64,
            type: ["string", "null"]
          },
          summary: { maxLength: 1000, type: ["string", "null"] },
          title: { maxLength: 240, minLength: 1, type: "string" },
          visuals: {
            description:
              "The supplied visuals, in the order the owner arranged them. The array index is the stored position, so the first entry is the primary visual. A replacement like the rest of this shape: an address left out is one the Offering no longer has.",
            items: { maxLength: 2048, minLength: 1, type: "string" },
            maxItems: 24,
            type: "array"
          }
        },
        required: ["categoryId", "title"],
        type: "object"
      },
      OfferingContent: {
        additionalProperties: false,
        properties: {
          attributes: {
            items: {
              additionalProperties: false,
              properties: {
                attributeId: { format: "uuid", type: "string" },
                booleanValue: { type: ["boolean", "null"] },
                numberValue: { type: ["number", "null"] },
                optionIds: {
                  items: { format: "uuid", type: "string" },
                  type: "array"
                },
                textValue: { type: ["string", "null"] }
              },
              required: [
                "attributeId",
                "booleanValue",
                "numberValue",
                "optionIds",
                "textValue"
              ],
              type: "object"
            },
            type: "array"
          },
          businessId: { format: "uuid", type: "string" },
          categoryId: { format: "uuid", type: "string" },
          id: { format: "uuid", type: "string" },
          pricing: { $ref: "#/components/schemas/OfferingPrice" },
          productKey: { type: ["string", "null"] },
          publishedAt: {
            description:
              "Initial Published At. Immutable once set; an edit never changes it.",
            format: "date-time",
            type: ["string", "null"]
          },
          slug: { type: "string" },
          source: {
            description:
              "How this record came to exist. Provenance only: it grants no capability, does not affect Final Offering Public Eligibility, and does not change moderation. An automated intake may modify only Offerings whose Source is `FEED`.",
            enum: ["MANUAL", "FEED", "BUSINESS"],
            type: "string"
          },
          status: {
            enum: ["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"],
            type: "string"
          },
          summary: { type: ["string", "null"] },
          title: { type: "string" },
          version: { minimum: 1, type: "integer" },
          visuals: { items: { type: "string" }, type: "array" }
        },
        required: [
          "attributes",
          "businessId",
          "categoryId",
          "id",
          "pricing",
          "productKey",
          "publishedAt",
          "slug",
          "source",
          "status",
          "summary",
          "title",
          "version",
          "visuals"
        ],
        type: "object"
      },
      EditableOfferingContent: {
        additionalProperties: false,
        description:
          "The owner's read of an Offering: what it holds, and what its Category lets it hold. One response rather than two requests, so a form cannot be built from definitions that stopped applying between them. Inactive definitions and retired options are absent — the write path would refuse a value for either.",
        properties: {
          applicableAttributes: {
            items: {
              additionalProperties: false,
              properties: {
                id: { format: "uuid", type: "string" },
                name: { type: "string" },
                options: {
                  description:
                    "Active allowed values, for the two Select kinds only.",
                  items: {
                    additionalProperties: false,
                    properties: {
                      id: { format: "uuid", type: "string" },
                      label: { type: "string" }
                    },
                    required: ["id", "label"],
                    type: "object"
                  },
                  type: "array"
                },
                requiredForPublication: { type: "boolean" },
                unit: { type: ["string", "null"] },
                valueKind: {
                  enum: [
                    "TEXT",
                    "NUMBER",
                    "BOOLEAN",
                    "SINGLE_SELECT",
                    "MULTI_SELECT"
                  ],
                  type: "string"
                }
              },
              required: [
                "id",
                "name",
                "options",
                "requiredForPublication",
                "unit",
                "valueKind"
              ],
              type: "object"
            },
            type: "array"
          },
          attributes: {
            items: {
              additionalProperties: false,
              properties: {
                attributeId: { format: "uuid", type: "string" },
                booleanValue: { type: ["boolean", "null"] },
                numberValue: { type: ["number", "null"] },
                optionIds: {
                  items: { format: "uuid", type: "string" },
                  type: "array"
                },
                textValue: { type: ["string", "null"] }
              },
              required: [
                "attributeId",
                "booleanValue",
                "numberValue",
                "optionIds",
                "textValue"
              ],
              type: "object"
            },
            type: "array"
          },
          businessId: { format: "uuid", type: "string" },
          categoryId: { format: "uuid", type: "string" },
          id: { format: "uuid", type: "string" },
          pricing: { $ref: "#/components/schemas/OfferingPrice" },
          productKey: { type: ["string", "null"] },
          publishedAt: {
            description:
              "Initial Published At. Immutable once set; an edit never changes it.",
            format: "date-time",
            type: ["string", "null"]
          },
          slug: { type: "string" },
          source: {
            description:
              "How this record came to exist. Provenance only: it grants no capability, does not affect Final Offering Public Eligibility, and does not change moderation. An automated intake may modify only Offerings whose Source is `FEED`.",
            enum: ["MANUAL", "FEED", "BUSINESS"],
            type: "string"
          },
          status: {
            enum: ["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"],
            type: "string"
          },
          summary: { type: ["string", "null"] },
          title: { type: "string" },
          version: { minimum: 1, type: "integer" },
          visuals: {
            description:
              "The supplied visuals as addresses, read back in `position` order so the owner sees the arrangement they saved rather than one the database happened to return.",
            items: { type: "string" },
            type: "array"
          }
        },
        required: [
          "applicableAttributes",
          "attributes",
          "businessId",
          "categoryId",
          "id",
          "pricing",
          "productKey",
          "publishedAt",
          "slug",
          "source",
          "status",
          "summary",
          "title",
          "version",
          "visuals"
        ],
        type: "object"
      },
      AuthorAffiliateDestination: {
        additionalProperties: false,
        description:
          "Carries a reference and nothing else. Review, Validate, Enable, Disable and Handoff Eligibility recalculation belong to Platform administration and cannot be requested here.",
        properties: {
          reference: { maxLength: 2048, minLength: 1, type: "string" }
        },
        required: ["reference"],
        type: "object"
      },
      AffiliateDestination: {
        additionalProperties: false,
        properties: {
          handoffEligibility: {
            description:
              "Eligible exactly when Destination Status is Enabled and Validation Result is Valid. Composed from those two, never set on its own.",
            enum: ["ELIGIBLE", "INELIGIBLE"],
            type: "string"
          },
          id: { format: "uuid", type: "string" },
          offeringId: { format: "uuid", type: "string" },
          reference: { type: "string" },
          status: {
            enum: ["DRAFT", "ENABLED", "DISABLED"],
            type: "string"
          },
          validationReason: { type: ["string", "null"] },
          validationResult: {
            enum: ["NOT_VALIDATED", "VALID", "INVALID"],
            type: "string"
          },
          version: { minimum: 1, type: "integer" }
        },
        required: [
          "handoffEligibility",
          "id",
          "offeringId",
          "reference",
          "status",
          "validationReason",
          "validationResult",
          "version"
        ],
        type: "object"
      },
      DestinationManagementEntry: {
        additionalProperties: false,
        description:
          "The Business-side Affiliate Destination management entry. `destination` is null where the Offering has none, which is the condition Create is offered for; where one exists, its status, validation result and Handoff Eligibility are PRD-0001's results reported unchanged. `entries` can hold only VIEW, CREATE and EDIT: Review, Validate, Enable and Disable are Platform administration actions and are not values a Business entry can take. Nothing here names an affiliate network, attribution, commission or settlement.",
        properties: {
          destination: {
            oneOf: [
              { $ref: "#/components/schemas/AffiliateDestination" },
              { type: "null" }
            ]
          },
          entries: {
            items: { enum: ["VIEW", "CREATE", "EDIT"], type: "string" },
            type: "array"
          },
          offering: {
            additionalProperties: false,
            properties: {
              id: { format: "uuid", type: "string" },
              status: {
                enum: ["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"],
                type: "string"
              },
              title: { type: "string" }
            },
            required: ["id", "status", "title"],
            type: "object"
          }
        },
        required: ["destination", "entries", "offering"],
        type: "object"
      },
      HandoffRate: {
        additionalProperties: false,
        description:
          'A count of Presentation Opens, a count of Affiliate Handoff Completions, and the ratio between them. `rate` is **null and never 0** where `opens` is zero: an Offering nobody has opened has no rate, and `0` would say "nobody chose this" where the truth is "nobody has looked" (PRD-0006 v2.5 §11.6.3).',
        properties: {
          handoffs: { minimum: 0, type: "integer" },
          opens: { minimum: 0, type: "integer" },
          rate: { maximum: 1, minimum: 0, type: ["number", "null"] }
        },
        required: ["handoffs", "opens", "rate"],
        type: "object"
      },
      AffiliateHandoffRate: {
        additionalProperties: false,
        description:
          "Affiliate Handoff Rate (PRD-0006 v2.5 §11.6). Derived from two occurrences the inventory already counts — no event, counter or record exists to produce it. Not advertising reporting: §20.5's exclusion is unchanged, and an Affiliate Handoff is a person choosing a seller they were comparing. It may never order, weight or mark anything in Discovery Results, and appears on no public or Business-facing surface. Per link means per Offering, because PRD-0001 §9.1 gives an Offering zero or one Affiliate Destination.",
        properties: {
          byOffering: {
            description:
              "The most-opened listings, ordered by Presentation Opens rather than by rate — a listing opened twice and handed off once scores 50% and tells nobody anything.",
            items: {
              allOf: [
                { $ref: "#/components/schemas/HandoffRate" },
                {
                  additionalProperties: false,
                  properties: {
                    offeringId: { format: "uuid", type: "string" },
                    slug: { type: "string" },
                    title: { type: "string" }
                  },
                  required: ["offeringId", "slug", "title"],
                  type: "object"
                }
              ]
            },
            type: "array"
          },
          overall: { $ref: "#/components/schemas/HandoffRate" }
        },
        required: ["byOffering", "overall"],
        type: "object"
      },
      Analytics: {
        additionalProperties: false,
        description:
          "Every figure is a count of records that already exist, grouped by results their own authorities produced. Nothing is derived, weighted, projected or scored. `actionable` carries where a workload indicator leads: it is navigation, and no entry performs anything.",
        properties: {
          actionable: {
            additionalProperties: false,
            properties: {
              DESTINATION_WORKLOAD: { type: "string" },
              OPEN_MODERATION_CASES: { type: "string" }
            },
            required: ["DESTINATION_WORKLOAD", "OPEN_MODERATION_CASES"],
            type: "object"
          },
          affiliateDestinations: {
            additionalProperties: false,
            properties: {
              handoffEligibility: { $ref: "#/components/schemas/Tally" },
              status: { $ref: "#/components/schemas/Tally" },
              validationResult: { $ref: "#/components/schemas/Tally" }
            },
            required: ["handoffEligibility", "status", "validationResult"],
            type: "object"
          },
          affiliateHandoffRate: {
            $ref: "#/components/schemas/AffiliateHandoffRate"
          },
          businesses: { $ref: "#/components/schemas/Tally" },
          coreFlow: {
            additionalProperties: false,
            properties: {
              AFFILIATE_HANDOFF_COMPLETIONS: {
                $ref: "#/components/schemas/CoreFlowCount"
              },
              COMPARE_STARTS: { $ref: "#/components/schemas/CoreFlowCount" },
              DECISION_CHAT_STARTS: {
                $ref: "#/components/schemas/CoreFlowCount"
              },
              DIRECT_CONTACT_COMPLETIONS: {
                $ref: "#/components/schemas/CoreFlowCount"
              },
              DISCOVERY_STARTS: { $ref: "#/components/schemas/CoreFlowCount" },
              OFFERING_PRESENTATION_OPENS: {
                $ref: "#/components/schemas/CoreFlowCount"
              }
            },
            required: [
              "AFFILIATE_HANDOFF_COMPLETIONS",
              "COMPARE_STARTS",
              "DECISION_CHAT_STARTS",
              "DIRECT_CONTACT_COMPLETIONS",
              "DISCOVERY_STARTS",
              "OFFERING_PRESENTATION_OPENS"
            ],
            type: "object"
          },
          destinationWorkload: { $ref: "#/components/schemas/Tally" },
          moderationCases: {
            additionalProperties: false,
            properties: {
              openByTarget: { $ref: "#/components/schemas/Tally" },
              status: { $ref: "#/components/schemas/Tally" }
            },
            required: ["openByTarget", "status"],
            type: "object"
          },
          offerings: {
            additionalProperties: false,
            properties: {
              lifecycle: { $ref: "#/components/schemas/Tally" },
              publicEligibility: { $ref: "#/components/schemas/Tally" }
            },
            required: ["lifecycle", "publicEligibility"],
            type: "object"
          },
          period: {
            enum: ["TODAY", "LAST_7_DAYS", "LAST_30_DAYS", "ALL_TIME"],
            type: "string"
          },
          userAccounts: { $ref: "#/components/schemas/Tally" }
        },
        required: [
          "actionable",
          "affiliateHandoffRate",
          "affiliateDestinations",
          "businesses",
          "coreFlow",
          "destinationWorkload",
          "moderationCases",
          "offerings",
          "period",
          "userAccounts"
        ],
        type: "object"
      },
      Tally: {
        additionalProperties: { minimum: 0, type: "integer" },
        description: "Counts keyed by the authoritative result they group by.",
        type: "object"
      },
      CoreFlowCount: {
        additionalProperties: false,
        description:
          "One core-flow indicator. `byDomain` is empty where the owning source supplies no Domain association, and is allowed not to sum to `overall`: an occurrence with no Domain is counted overall and appears in none.",
        properties: {
          byDomain: {
            items: {
              additionalProperties: false,
              properties: {
                count: { minimum: 0, type: "integer" },
                domain: DOMAIN_KEY,
                domainName: DOMAIN_NAME
              },
              required: ["count", "domain", "domainName"],
              type: "object"
            },
            type: "array"
          },
          overall: { minimum: 0, type: "integer" }
        },
        required: ["byDomain", "overall"],
        type: "object"
      },
      AdminPanel: {
        additionalProperties: false,
        description:
          "The Admin Panel baseline. `userId` and nothing else identifies the Admin, because authorization attaches to the existing User Account and V1 creates no separate Admin identity, account or login. `functions` is a closed list of Platform behaviour that exists today; no provisioning verb is a member. `inheritedBaselines` states that entering Admin context takes nothing away — Guest and authenticated User abilities survive it.",
        properties: {
          functions: {
            items: {
              enum: [
                "MANAGE_CATEGORIES",
                "MANAGE_ATTRIBUTE_DEFINITIONS",
                "ADMINISTER_AFFILIATE_DESTINATIONS",
                "MANAGE_MODERATION_CASES",
                "MODERATE_OFFERINGS",
                "MODERATE_BUSINESSES",
                "MODERATE_USER_ACCESS",
                "REQUEST_CORRECTION",
                "READ_OFFERING_HISTORY"
              ],
              type: "string"
            },
            type: "array"
          },
          inheritedBaselines: {
            items: {
              enum: ["GUEST", "AUTHENTICATED_USER"],
              type: "string"
            },
            type: "array"
          },
          ownedBusinessIds: {
            items: { format: "uuid", type: "string" },
            type: "array"
          },
          userId: { format: "uuid", type: "string" }
        },
        required: [
          "functions",
          "inheritedBaselines",
          "ownedBusinessIds",
          "userId"
        ],
        type: "object"
      },
      DestinationWorkloadItem: {
        additionalProperties: false,
        description:
          "One Affiliate Destination and what is still owed on it. `category` is derived on every read and stored nowhere; `null` means nothing is owed.",
        properties: {
          businessId: { format: "uuid", type: "string" },
          category: {
            enum: [
              "NEEDS_VALIDATION",
              "BUSINESS_CORRECTION_NEEDED",
              "READY_TO_ENABLE",
              null
            ],
            type: ["string", "null"]
          },
          destination: { $ref: "#/components/schemas/AffiliateDestination" }
        },
        required: ["businessId", "category", "destination"],
        type: "object"
      },
      DestinationWorkload: {
        additionalProperties: false,
        properties: {
          items: {
            items: { $ref: "#/components/schemas/DestinationWorkloadItem" },
            type: "array"
          }
        },
        required: ["items"],
        type: "object"
      },
      UserAccess: {
        additionalProperties: false,
        description:
          "A User Account after moderation: its identifier and its access status, and nothing else. There is no Admin-authorization field, because nothing here changes one and reporting it would invite somebody to try; and no Business, Offering or eligibility, because none of them moves.",
        properties: {
          status: { enum: ["ENABLED", "SUSPENDED"], type: "string" },
          userId: { format: "uuid", type: "string" }
        },
        required: ["status", "userId"],
        type: "object"
      },
      ModerationCase: {
        additionalProperties: false,
        description:
          "One General Moderation case. `status` is workflow and is not any target product state — there is no lifecycle, moderation status, access status, eligibility or validation result here, and a reader who wants one asks the authority that owns it. `availableActions` is a subset of the exact seven General Moderation actions, narrowed by the target's kind, its current condition, and what has a path today. Affiliate Destination Review, Validate, Enable and Disable are a separate action family and are not members.",
        properties: {
          availableActions: {
            items: {
              enum: [
                "REQUEST_CORRECTION",
                "HIDE_OFFERING",
                "RESTORE_OFFERING",
                "RESTRICT_BUSINESS",
                "RESTORE_BUSINESS",
                "SUSPEND_USER",
                "REINSTATE_USER"
              ],
              type: "string"
            },
            type: "array"
          },
          businessId: { format: "uuid", type: ["string", "null"] },
          businessName: {
            description:
              "What the target is called, so a queue of cases can be triaged without opening every row (I81). Identity only: the target's lifecycle, moderation status and access status are read to decide which actions to offer and are never reported here. Null where the case names no Business, or where it was removed after the case was opened.",
            type: ["string", "null"]
          },
          closedAt: { format: "date-time", type: ["string", "null"] },
          id: { format: "uuid", type: "string" },
          offeringId: { format: "uuid", type: ["string", "null"] },
          offeringSlug: { type: ["string", "null"] },
          offeringTitle: { type: ["string", "null"] },
          openedAt: { format: "date-time", type: "string" },
          reReviewRequired: {
            description:
              "True while the owner has saved a correction that nobody has looked at since. Closure is refused while it holds.",
            type: "boolean"
          },
          resolutions: {
            description:
              "An applied action or a recorded no-action decision, never both and never neither. Closure is conditional on one of these existing.",
            items: {
              additionalProperties: false,
              properties: {
                action: {
                  enum: [
                    "REQUEST_CORRECTION",
                    "HIDE_OFFERING",
                    "RESTORE_OFFERING",
                    "RESTRICT_BUSINESS",
                    "RESTORE_BUSINESS",
                    "SUSPEND_USER",
                    "REINSTATE_USER",
                    null
                  ],
                  type: ["string", "null"]
                },
                noActionReason: { type: ["string", "null"] },
                recordedAt: { format: "date-time", type: "string" }
              },
              required: ["action", "noActionReason", "recordedAt"],
              type: "object"
            },
            type: "array"
          },
          status: { enum: ["OPEN", "CLOSED"], type: "string" },
          targetType: {
            enum: ["OFFERING", "BUSINESS", "USER_ACCOUNT"],
            type: "string"
          },
          userId: { format: "uuid", type: ["string", "null"] }
        },
        required: [
          "availableActions",
          "businessId",
          "businessName",
          "closedAt",
          "id",
          "offeringId",
          "offeringSlug",
          "offeringTitle",
          "openedAt",
          "reReviewRequired",
          "resolutions",
          "status",
          "targetType",
          "userId"
        ],
        type: "object"
      },
      ModerationCases: {
        additionalProperties: false,
        properties: {
          cases: {
            items: { $ref: "#/components/schemas/ModerationCase" },
            type: "array"
          }
        },
        required: ["cases"],
        type: "object"
      },
      OpenModerationCase: {
        description:
          "Exactly one target, expressed as a union rather than three optional fields, so a request naming both an Offering and a User is not one this contract can carry.",
        discriminator: { propertyName: "targetType" },
        oneOf: [
          {
            additionalProperties: false,
            properties: {
              offeringId: { format: "uuid", type: "string" },
              targetType: { const: "OFFERING", type: "string" }
            },
            required: ["offeringId", "targetType"],
            type: "object"
          },
          {
            additionalProperties: false,
            properties: {
              businessId: { format: "uuid", type: "string" },
              targetType: { const: "BUSINESS", type: "string" }
            },
            required: ["businessId", "targetType"],
            type: "object"
          },
          {
            additionalProperties: false,
            properties: {
              targetType: { const: "USER_ACCOUNT", type: "string" },
              userId: { format: "uuid", type: "string" }
            },
            required: ["targetType", "userId"],
            type: "object"
          }
        ]
      },
      RecordReReview: {
        additionalProperties: false,
        description:
          "An optional note and nothing else. The act is the point — somebody looked at what the owner did — and requiring a justification would make the correct thing feel expensive.",
        properties: { note: { maxLength: 1000, type: ["string", "null"] } },
        type: "object"
      },
      RecordNoAction: {
        additionalProperties: false,
        description:
          "A reason and nothing else. A blank no-action decision would be indistinguishable from never having looked.",
        properties: {
          reason: { maxLength: 1000, minLength: 1, type: "string" }
        },
        required: ["reason"],
        type: "object"
      },
      CorrectionNotice: {
        additionalProperties: false,
        description:
          "One correction notice as its owner sees it. It states a target, where to go about it, and whether the bounded correction-edit path is open — and nothing else. There is no body, thread, reply field or participant, because Request Correction creates no Messaging. `managementArea` is null where the owner is not currently authorized for that area. `reReviewRequired` is true once an owner response has been saved: the record of the response is the requirement, not a flag anybody sets.",
        properties: {
          boundedEditAvailable: { type: "boolean" },
          caseId: { format: "uuid", type: "string" },
          caseStatus: { enum: ["OPEN", "CLOSED"], type: "string" },
          contentArea: {
            enum: ["TITLE", "SUMMARY", "ATTRIBUTES", null],
            type: ["string", "null"]
          },
          id: { format: "uuid", type: "string" },
          managementArea: {
            enum: [
              "BUSINESS_INFORMATION",
              "OFFERING_CONTENT",
              "AFFILIATE_DESTINATION",
              null
            ],
            type: ["string", "null"]
          },
          note: { type: ["string", "null"] },
          offeringId: { format: "uuid", type: ["string", "null"] },
          reReviewRequired: { type: "boolean" },
          requestedAt: { format: "date-time", type: "string" },
          target: {
            description:
              "The four Business-owned Request Correction targets. User Account correction is outside V1 and is not a value this can take.",
            enum: [
              "BUSINESS_INFORMATION",
              "OFFERING_CONTENT",
              "AFFILIATE_DESTINATION_CONFIGURATION",
              "DIRECT_CONTACT_INFORMATION"
            ],
            type: "string"
          }
        },
        required: [
          "boundedEditAvailable",
          "caseId",
          "caseStatus",
          "contentArea",
          "id",
          "managementArea",
          "note",
          "offeringId",
          "reReviewRequired",
          "requestedAt",
          "target"
        ],
        type: "object"
      },
      CorrectionNotices: {
        additionalProperties: false,
        properties: {
          notices: {
            items: { $ref: "#/components/schemas/CorrectionNotice" },
            type: "array"
          }
        },
        required: ["notices"],
        type: "object"
      },
      RequestCorrection: {
        additionalProperties: false,
        description:
          "What Platform records when it asks for a correction. An Offering-content request carries the exact Offering and content area; every other target carries neither, and the database refuses any other combination. Category is not a correctable content area: a correction fixes what an Offering says rather than moving it elsewhere in the catalogue.",
        properties: {
          contentArea: {
            enum: ["TITLE", "SUMMARY", "ATTRIBUTES", null],
            type: ["string", "null"]
          },
          note: { maxLength: 1000, type: ["string", "null"] },
          offeringId: { format: "uuid", type: ["string", "null"] },
          target: {
            enum: [
              "BUSINESS_INFORMATION",
              "OFFERING_CONTENT",
              "AFFILIATE_DESTINATION_CONFIGURATION",
              "DIRECT_CONTACT_INFORMATION"
            ],
            type: "string"
          }
        },
        required: ["target"],
        type: "object"
      },
      SaveCorrection: {
        description:
          "One bounded correction save. Each member carries exactly the one content area it names, so a request to change the targeted area while also changing another is not a request this contract can express — the untargeted edit has no field to travel in.",
        discriminator: { propertyName: "area" },
        oneOf: [
          {
            additionalProperties: false,
            properties: {
              area: { const: "TITLE", type: "string" },
              title: { maxLength: 240, minLength: 1, type: "string" }
            },
            required: ["area", "title"],
            type: "object"
          },
          {
            additionalProperties: false,
            properties: {
              area: { const: "SUMMARY", type: "string" },
              summary: { maxLength: 1000, type: ["string", "null"] }
            },
            required: ["area"],
            type: "object"
          },
          {
            additionalProperties: false,
            properties: {
              area: { const: "ATTRIBUTES", type: "string" },
              attributes: {
                items: {
                  $ref: "#/components/schemas/OfferingAttributeValueInput"
                },
                maxItems: 200,
                type: "array"
              }
            },
            required: ["area", "attributes"],
            type: "object"
          }
        ]
      },
      ReviewAffiliateDestination: {
        additionalProperties: false,
        description:
          "Review carries a note and nothing else, because it changes nothing else.",
        properties: { note: { maxLength: 1000, type: ["string", "null"] } },
        type: "object"
      },
      ValidateAffiliateDestination: {
        additionalProperties: false,
        description:
          "Produces exactly one current result. NOT_VALIDATED is the absence of a result and cannot be produced by validating.",
        properties: {
          reason: { maxLength: 1000, type: ["string", "null"] },
          result: { enum: ["VALID", "INVALID"], type: "string" }
        },
        required: ["result"],
        type: "object"
      },
      BusinessDashboard: {
        additionalProperties: false,
        description:
          "The Business Dashboard: a place to stand, not a report. It names the active Business and its Moderation Status — so an owner sees a restriction rather than discovering it by being refused — and lists the Offerings organized by lifecycle, by reference and without redefining any authoritative state. There is no count, no total, no ranking, no trend and no conversion or revenue figure, and no field in which one could appear. Requires an Enabled authenticated User who owns this exact Business; Admin authorization is not ownership and opens nothing.",
        properties: {
          business: {
            additionalProperties: false,
            properties: {
              id: { format: "uuid", type: "string" },
              moderationStatus: {
                enum: ["UNRESTRICTED", "RESTRICTED"],
                type: "string"
              },
              name: { type: "string" },
              publicExposure: {
                enum: ["ELIGIBLE", "INELIGIBLE"],
                type: "string"
              },
              slug: { type: "string" }
            },
            required: [
              "id",
              "moderationStatus",
              "name",
              "publicExposure",
              "slug"
            ],
            type: "object"
          },
          inventory: {
            additionalProperties: false,
            properties: {
              ARCHIVED: {
                items: { $ref: "#/components/schemas/ManagedOffering" },
                type: "array"
              },
              DRAFT: {
                items: { $ref: "#/components/schemas/ManagedOffering" },
                type: "array"
              },
              HIDDEN: {
                items: { $ref: "#/components/schemas/ManagedOffering" },
                type: "array"
              },
              PUBLISHED: {
                items: { $ref: "#/components/schemas/ManagedOffering" },
                type: "array"
              }
            },
            required: ["ARCHIVED", "DRAFT", "HIDDEN", "PUBLISHED"],
            type: "object"
          }
        },
        required: ["business", "inventory"],
        type: "object"
      },
      ManagedOffering: {
        additionalProperties: false,
        description:
          "One owned Offering with the entries currently permitted for it, composed from PRD-0001's lifecycle rules and PRD-0005's Business access rules — the same two authorities the write path consults, so an offered entry is one that would be honoured. There is no RESTORE, because a Business owner may not return a Hidden Offering to Published, and no DELETE, because V1 has no permanent Offering deletion. `status` and `publicEligibility` stay separate: lifecycle Published is not the same as being publicly eligible.",
        properties: {
          categoryId: { format: "uuid", type: "string" },
          createdAt: { format: "date-time", type: "string" },
          entries: {
            items: {
              enum: [
                "VIEW",
                "EDIT",
                "PUBLISH",
                "RETIRE",
                "MANAGE_AFFILIATE_DESTINATION"
              ],
              type: "string"
            },
            type: "array"
          },
          id: { format: "uuid", type: "string" },
          publicEligibility: {
            enum: ["PENDING", "ELIGIBLE", "INELIGIBLE", "WITHDRAWN"],
            type: "string"
          },
          slug: { type: "string" },
          status: {
            enum: ["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"],
            type: "string"
          },
          title: { type: "string" },
          updatedAt: { format: "date-time", type: "string" }
        },
        required: [
          "categoryId",
          "createdAt",
          "entries",
          "id",
          "publicEligibility",
          "slug",
          "status",
          "title",
          "updatedAt"
        ],
        type: "object"
      },
      OfferingInventoryEntry: {
        additionalProperties: false,
        properties: {
          categoryId: { format: "uuid", type: "string" },
          createdAt: { format: "date-time", type: "string" },
          id: { format: "uuid", type: "string" },
          publicEligibility: {
            description:
              "The recorded final Offering Public Eligibility. PRD-0001 owns this result; consumers read it and do not recalculate it.",
            enum: ["PENDING", "ELIGIBLE", "INELIGIBLE", "WITHDRAWN"],
            type: "string"
          },
          slug: { type: "string" },
          status: {
            enum: ["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"],
            type: "string"
          },
          title: { type: "string" },
          updatedAt: { format: "date-time", type: "string" }
        },
        required: [
          "categoryId",
          "createdAt",
          "id",
          "publicEligibility",
          "slug",
          "status",
          "title",
          "updatedAt"
        ],
        type: "object"
      },
      OfferingInventory: {
        additionalProperties: false,
        properties: {
          offerings: {
            items: { $ref: "#/components/schemas/OfferingInventoryEntry" },
            type: "array"
          }
        },
        required: ["offerings"],
        type: "object"
      },
      CreateDraftOffering: {
        additionalProperties: false,
        properties: {
          categoryId: { format: "uuid", type: "string" },
          slug: { maxLength: 160, minLength: 1, type: "string" },
          summary: { maxLength: 1000, type: "string" },
          title: { maxLength: 240, minLength: 1, type: "string" }
        },
        required: ["categoryId", "slug", "title"],
        type: "object"
      },
      DraftOffering: {
        additionalProperties: false,
        properties: {
          businessId: { format: "uuid", type: "string" },
          categoryId: { format: "uuid", type: "string" },
          createdAt: { format: "date-time", type: "string" },
          id: { format: "uuid", type: "string" },
          slug: { maxLength: 160, minLength: 1, type: "string" },
          status: { enum: ["DRAFT"], type: "string" },
          summary: { maxLength: 1000, type: ["string", "null"] },
          title: { type: "string" },
          updatedAt: { format: "date-time", type: "string" },
          version: { minimum: 1, type: "integer" }
        },
        required: [
          "businessId",
          "categoryId",
          "createdAt",
          "id",
          "slug",
          "status",
          "summary",
          "title",
          "updatedAt",
          "version"
        ],
        type: "object"
      }
    }
  },
  info: {
    description: "V1 decision-completion marketplace HTTP API",
    title: "Commerce Platform API",
    version: "1.0.0"
  },
  openapi: "3.1.0",
  paths: {
    "/api/v1/auth/registrations": {
      post: {
        description:
          "Answers identically whether or not the address is already registered. The proof is delivered by email; the response carries nothing that could complete a registration.",
        operationId: "beginRegistration",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BeginRegistration" }
            }
          },
          required: true
        },
        responses: {
          "202": {
            description: "Registration accepted for email-control proof"
          },
          "400": errorResponse("Invalid registration input"),
          "429": errorResponse("Too many registration attempts")
        },
        tags: ["Identity"]
      }
    },
    "/api/v1/auth/registrations/confirmations": {
      post: {
        operationId: "confirmRegistration",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ConfirmRegistration" }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Session" }
              }
            },
            description: "Account created and session established"
          },
          "400": errorResponse("Registration link is invalid or has expired"),
          "403": errorResponse("Request origin is missing or not allowed")
        },
        tags: ["Identity"]
      }
    },
    "/api/v1/auth/password-resets": {
      post: {
        description:
          "Answers identically whether or not the address has an account.",
        operationId: "beginPasswordReset",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BeginPasswordReset" }
            }
          },
          required: true
        },
        responses: {
          "202": { description: "Recovery accepted for email-control proof" },
          "400": errorResponse("Invalid recovery input"),
          "429": errorResponse("Too many recovery attempts")
        },
        tags: ["Identity"]
      }
    },
    "/api/v1/auth/password-resets/completions": {
      post: {
        description:
          "Sets the new password. No session is established; the person may then attempt Login.",
        operationId: "completePasswordReset",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CompletePasswordReset" }
            }
          },
          required: true
        },
        responses: {
          "204": { description: "Password set" },
          "400": errorResponse("Recovery link is invalid or has expired")
        },
        tags: ["Identity"]
      }
    },
    "/api/v1/auth/sessions": {
      post: {
        description:
          "Establishes a session, so a recognised request origin is required.",
        operationId: "login",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Login" }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Session" }
              }
            },
            description: "Session established"
          },
          "400": errorResponse("Invalid credentials input"),
          "401": errorResponse("Credentials rejected"),
          "403": errorResponse("Request origin is missing or not allowed")
        },
        tags: ["Identity"]
      }
    },
    "/api/v1/auth/sessions/current": {
      delete: {
        operationId: "logout",
        responses: {
          "204": { description: "Session ended" },
          "403": errorResponse("Request origin is missing or not allowed")
        },
        tags: ["Identity"]
      },
      get: {
        operationId: "getCurrentSession",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Session" }
              }
            },
            description: "Current authenticated session"
          },
          "401": errorResponse("No authenticated session")
        },
        tags: ["Identity"]
      }
    },
    "/api/v1/auth/me/admin-context": {
      delete: {
        operationId: "leaveAdminContext",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Session" }
              }
            },
            description: "Returned to the authenticated User baseline"
          },
          "401": errorResponse("No authenticated session"),
          "403": errorResponse("Request origin is missing or not allowed")
        },
        tags: ["Identity"]
      },
      put: {
        description:
          "Enters the Admin surface. Authorization itself is provisioned operationally and has no product API.",
        operationId: "enterAdminContext",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Session" }
              }
            },
            description: "Admin context entered"
          },
          "401": errorResponse("No authenticated session"),
          "403": errorResponse(
            "Admin context is unavailable, or the request origin is not allowed"
          )
        },
        tags: ["Identity"]
      }
    },
    "/api/v1/auth/me/businesses": {
      get: {
        description:
          "The Businesses a choice may be made from; none is chosen silently.",
        operationId: "listAuthorizedBusinesses",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthorizedBusinesses" }
              }
            },
            description: "Businesses the person is authorized for"
          },
          "401": errorResponse("No authenticated session")
        },
        tags: ["Identity"]
      }
    },
    "/api/v1/auth/me/business-context": {
      delete: {
        operationId: "leaveBusinessContext",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Session" }
              }
            },
            description: "Returned to the authenticated User baseline"
          },
          "401": errorResponse("No authenticated session"),
          "403": errorResponse("Request origin is missing or not allowed")
        },
        tags: ["Identity"]
      },
      put: {
        operationId: "selectBusinessContext",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SelectBusinessContext" }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Session" }
              }
            },
            description: "Business context entered"
          },
          "400": errorResponse("Invalid context selection"),
          "401": errorResponse("No authenticated session"),
          "403": errorResponse("Request origin is missing or not allowed"),
          "404": errorResponse("No authorized Business matches that identifier")
        },
        tags: ["Identity"]
      }
    },
    "/api/v1/businesses": {
      get: {
        operationId: "listOwnedBusinesses",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OwnedBusinesses" }
              }
            },
            description: "Businesses owned by the acting person"
          },
          "401": errorResponse("Authentication required")
        },
        tags: ["Business"]
      },
      post: {
        description:
          "Creates a Business owned by the acting person. No Admin approval precedes it.",
        operationId: "createBusiness",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateBusiness" }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OwnedBusiness" }
              }
            },
            description: "Business created, Unrestricted and Eligible"
          },
          "400": errorResponse("Invalid Business input"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "Account is not active, or the request origin is not allowed"
          ),
          "409": errorResponse("Business slug conflict")
        },
        tags: ["Business"]
      }
    },
    "/api/v1/admin/attributes": {
      get: {
        description:
          "Every Attribute definition with its applicability and allowed values, retired values included.",
        operationId: "listAttributes",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Attributes" }
              }
            },
            description: "Attribute definitions"
          },
          "401": errorResponse("Authentication required"),
          "403": errorResponse("An entered Admin context is required")
        },
        tags: ["Platform"]
      },
      post: {
        description:
          "Creates a definition with its complete property set, its applicable Categories and, for a Select kind, its allowed values.",
        operationId: "createAttribute",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateAttribute" }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Attribute" }
              }
            },
            description: "Attribute definition created"
          },
          "400": errorResponse("Invalid Attribute definition"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "An entered Admin context is required, or the request origin is not allowed"
          ),
          "404": errorResponse("An applicable Category does not exist"),
          "409": errorResponse("The stable key is taken"),
          "422": errorResponse(
            "The properties contradict the value kind: filterable Text, a unit outside Number, or a Select with no allowed value"
          )
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/attributes/{attributeId}/properties": {
      put: {
        description:
          "Changes display name, unit, filterable and comparable. Affects future Discovery and Compare presentation only; no Offering lifecycle moves.",
        operationId: "updateAttributeProperties",
        parameters: [
          {
            in: "path",
            name: "attributeId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateAttributeProperties"
              }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Attribute" }
              }
            },
            description: "Properties saved"
          },
          "400": errorResponse("Invalid Attribute properties"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "An entered Admin context is required, or the request origin is not allowed"
          ),
          "404": errorResponse("No Attribute definition matches"),
          "422": errorResponse("The properties contradict the value kind")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/attributes/{attributeId}/value-kind": {
      put: {
        description:
          "Changes the value kind. Refused while any Draft, Published or Hidden Offering holds a value, which would otherwise be silently reinterpreted.",
        operationId: "changeAttributeValueKind",
        parameters: [
          {
            in: "path",
            name: "attributeId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ChangeAttributeValueKind"
              }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Attribute" }
              }
            },
            description: "Value kind changed"
          },
          "400": errorResponse("Invalid value kind"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "An entered Admin context is required, or the request origin is not allowed"
          ),
          "404": errorResponse("No Attribute definition matches"),
          "409": errorResponse("An Offering still holds a value"),
          "422": errorResponse("The value kind contradicts other properties")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/attributes/{attributeId}/categories": {
      put: {
        description:
          "Replaces the applicable Category set. Additions are unconditional; a removal is refused while an Offering in that Category holds a value.",
        operationId: "setAttributeCategories",
        parameters: [
          {
            in: "path",
            name: "attributeId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SetAttributeCategories" }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Attribute" }
              }
            },
            description: "Applicability saved"
          },
          "400": errorResponse("Invalid applicability"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "An entered Admin context is required, or the request origin is not allowed"
          ),
          "404": errorResponse("No Attribute definition or Category matches"),
          "409": errorResponse(
            "An Offering in a removed Category holds a value"
          )
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/attributes/{attributeId}/required-for-publication": {
      put: {
        description:
          "Sets the required-for-publication flag. Enabling it is refused unless every Published and Hidden Offering in every applicable Category already has a value.",
        operationId: "setAttributeRequiredForPublication",
        parameters: [
          {
            in: "path",
            name: "attributeId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SetAttributeRequired" }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Attribute" }
              }
            },
            description: "Required flag saved"
          },
          "400": errorResponse("Invalid required flag"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "An entered Admin context is required, or the request origin is not allowed"
          ),
          "404": errorResponse("No Attribute definition matches"),
          "409": errorResponse("An existing Offering has no value yet")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/attributes/{attributeId}/options": {
      post: {
        description:
          "Adds an allowed value to a Select definition. Adding takes nothing away, so it is unguarded.",
        operationId: "addAttributeOption",
        parameters: [
          {
            in: "path",
            name: "attributeId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AttributeOptionInput" }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Attribute" }
              }
            },
            description: "Allowed value added"
          },
          "400": errorResponse("Invalid allowed value"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "An entered Admin context is required, or the request origin is not allowed"
          ),
          "404": errorResponse("No Attribute definition matches"),
          "409": errorResponse("The allowed-value stable key is taken"),
          "422": errorResponse("The definition is not a Select kind")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/attributes/{attributeId}/options/{optionId}/label": {
      put: {
        description:
          "Relabels an allowed value. Refused while an Offering uses it, since the change would alter what that Offering appears to say.",
        operationId: "relabelAttributeOption",
        parameters: [
          {
            in: "path",
            name: "attributeId",
            required: true,
            schema: { format: "uuid", type: "string" }
          },
          {
            in: "path",
            name: "optionId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RelabelAttributeOption" }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Attribute" }
              }
            },
            description: "Allowed value relabelled"
          },
          "400": errorResponse("Invalid label"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "An entered Admin context is required, or the request origin is not allowed"
          ),
          "404": errorResponse(
            "No Attribute definition or allowed value matches"
          ),
          "409": errorResponse("An Offering still uses this allowed value")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/attributes/{attributeId}/options/{optionId}/retirement": {
      post: {
        description:
          "Retires an allowed value. Refused while an Offering uses it, and refused if it is the last one a Select definition has. Nothing is deleted.",
        operationId: "retireAttributeOption",
        parameters: [
          {
            in: "path",
            name: "attributeId",
            required: true,
            schema: { format: "uuid", type: "string" }
          },
          {
            in: "path",
            name: "optionId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Attribute" }
              }
            },
            description: "Allowed value retired"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "An entered Admin context is required, or the request origin is not allowed"
          ),
          "404": errorResponse(
            "No Attribute definition or allowed value matches"
          ),
          "409": errorResponse("An Offering still uses this allowed value"),
          "422": errorResponse("It is the last allowed value")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/categories/assignable": {
      get: {
        description:
          "Every Category an Offering may currently be assigned to, each with its whole path. Public, like the catalogue it comes from: it answers where an Offering could go, which Browse already answers publicly.",
        operationId: "listAssignableCategories",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AssignableCategories" }
              }
            },
            description: "Assignable Categories"
          }
        },
        tags: ["Catalog"]
      }
    },
    "/api/v1/admin/categories": {
      get: {
        description:
          "Every Category, retired ones included: a retired definition stays readable to management even though active Browse excludes it.",
        operationId: "listCategories",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Categories" }
              }
            },
            description: "Category definitions"
          },
          "401": errorResponse("Authentication required"),
          "403": errorResponse("An entered Admin context is required")
        },
        tags: ["Platform"]
      },
      post: {
        description:
          "Creates a root Category under one V1 Domain, or a child that inherits its parent's Domain.",
        operationId: "createCategory",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCategory" }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Category" }
              }
            },
            description: "Category created"
          },
          "400": errorResponse("Invalid Category input"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "An entered Admin context is required, or the request origin is not allowed"
          ),
          "404": errorResponse("No Category matches the given parent"),
          "409": errorResponse(
            "The parent is retired, or the slug or stable key is taken"
          )
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/categories/{categoryId}/name": {
      put: {
        description:
          "Changes the display name. Category identity is unaffected: no identifier, slug, stable key or Domain can be carried by this request.",
        operationId: "renameCategory",
        parameters: [
          {
            in: "path",
            name: "categoryId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RenameCategory" }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Category" }
              }
            },
            description: "Category renamed"
          },
          "400": errorResponse("Invalid Category name"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "An entered Admin context is required, or the request origin is not allowed"
          ),
          "404": errorResponse("No Category matches that identifier")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/categories/{categoryId}/parent": {
      put: {
        description:
          "Moves a Category within its own Domain. A null parent promotes it to a root of the same Domain. Cross-Domain moves and ancestry cycles are refused.",
        operationId: "reparentCategory",
        parameters: [
          {
            in: "path",
            name: "categoryId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReparentCategory" }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Category" }
              }
            },
            description: "Category reparented"
          },
          "400": errorResponse("Invalid parent"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "An entered Admin context is required, or the request origin is not allowed"
          ),
          "404": errorResponse("No Category matches that identifier"),
          "409": errorResponse(
            "The proposed parent is in another Domain or inside the Category's own ancestry"
          )
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/categories/{categoryId}/retirement": {
      post: {
        description:
          "Retires a Category. Refused while an active child or an assigned Draft, Published or Hidden Offering remains; Archived history does not block it. Nothing is deleted.",
        operationId: "retireCategory",
        parameters: [
          {
            in: "path",
            name: "categoryId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Category" }
              }
            },
            description: "Category retired"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "An entered Admin context is required, or the request origin is not allowed"
          ),
          "404": errorResponse("No Category matches that identifier"),
          "409": errorResponse("An active dependency remains")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/businesses/{businessId}/information": {
      get: {
        description:
          "Every Business Information field for the owner, including protected Direct Contact channels. Never available to a Guest.",
        operationId: "getBusinessInformation",
        parameters: [
          {
            in: "path",
            name: "businessId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BusinessInformation" }
              }
            },
            description: "Complete Business Information for the owner"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "404": errorResponse("No owned Business matches that identifier")
        },
        tags: ["Business"]
      },
      put: {
        description:
          "Replaces the complete Business Information set. An omitted optional field is a removal. Changes no moderation status, exposure input or Offering state by itself.",
        operationId: "updateBusinessInformation",
        parameters: [
          {
            in: "path",
            name: "businessId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateBusinessInformation"
              }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BusinessInformation" }
              }
            },
            description: "Business Information saved"
          },
          "400": errorResponse("Invalid Business Information"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "Account is not active, or the request origin is not allowed"
          ),
          "404": errorResponse("No owned Business matches that identifier")
        },
        tags: ["Business"]
      }
    },
    "/api/v1/businesses/{businessId}/offerings": {
      get: {
        description:
          "The owning Business management inventory. Every lifecycle state is listed: management visibility is not public exposure, so an Ineligible Offering is exactly what its owner needs to see. A Restricted Business may not create, but its owner may still read this.",
        operationId: "listBusinessOfferings",
        parameters: [
          {
            in: "path",
            name: "businessId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OfferingInventory" }
              }
            },
            description: "Offerings owned by this Business"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "404": errorResponse("No owned Business matches that identifier")
        },
        tags: ["Offering"]
      },
      post: {
        operationId: "createDraftOffering",
        parameters: [
          {
            in: "path",
            name: "businessId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateDraftOffering" }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DraftOffering" }
              }
            },
            description: "Draft Offering created"
          },
          "400": errorResponse("Invalid request"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "Business cannot author offerings, or its context is not selected"
          ),
          "404": errorResponse("Business or catalog resource not found"),
          "409": errorResponse("Offering slug conflict")
        },
        tags: ["Offering"]
      }
    },
    "/api/v1/businesses/{businessId}/offerings/{offeringId}": {
      get: {
        operationId: "getDraftOffering",
        parameters: [
          {
            in: "path",
            name: "businessId",
            required: true,
            schema: { format: "uuid", type: "string" }
          },
          {
            in: "path",
            name: "offeringId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DraftOffering" }
              }
            },
            description: "Owned Draft Offering"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Account is not active"),
          "404": errorResponse("Offering not found")
        },
        tags: ["Offering"]
      }
    },
    "/api/v1/businesses/{businessId}/offerings/{offeringId}/content": {
      get: {
        description:
          "The Offering's complete content, Attribute values included, together with the Attributes its Category applies. Every lifecycle state is readable, Archived among them.",
        operationId: "getOfferingContent",
        parameters: [
          {
            in: "path",
            name: "businessId",
            required: true,
            schema: { format: "uuid", type: "string" }
          },
          {
            in: "path",
            name: "offeringId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/EditableOfferingContent"
                }
              }
            },
            description: "Offering content and the Attributes it may hold"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "404": errorResponse("No owned Offering matches that identifier")
        },
        tags: ["Offering"]
      },
      put: {
        description:
          "Replaces the Offering's content. A Draft may be saved freely; a Published or Hidden Offering only while the Universal Publication Minimum remains satisfied. An Archived Offering cannot be edited, and a Restricted Business may edit only its Drafts.",
        operationId: "editOfferingContent",
        parameters: [
          {
            in: "path",
            name: "businessId",
            required: true,
            schema: { format: "uuid", type: "string" }
          },
          {
            in: "path",
            name: "offeringId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EditOffering" }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OfferingContent" }
              }
            },
            description: "Offering content saved"
          },
          "400": errorResponse("Invalid Offering content"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "The Offering is Archived, the Business is Restricted beyond Draft, the account is not active, or the request origin is not allowed"
          ),
          "404": errorResponse("No owned Offering matches that identifier"),
          "422": errorResponse(
            "The edit would leave a Published or Hidden Offering below the Universal Publication Minimum, or a value does not match its Attribute kind"
          )
        },
        tags: ["Offering"]
      }
    },
    "/api/v1/businesses/{businessId}/offerings/{offeringId}/publication": {
      post: {
        description:
          "Publishes an owned Draft. Requires an Unrestricted Business and the Universal Publication Minimum; any gate failing leaves the Offering Draft. The first success creates the immutable Initial Published At. Published does not by itself make the Offering public — final Offering Public Eligibility is evaluated separately.",
        operationId: "publishOffering",
        parameters: [
          {
            in: "path",
            name: "businessId",
            required: true,
            schema: { format: "uuid", type: "string" }
          },
          {
            in: "path",
            name: "offeringId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OfferingContent" }
              }
            },
            description: "Offering published"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "The Business is Restricted, the account is not active, or the request origin is not allowed"
          ),
          "404": errorResponse("No owned Offering matches that identifier"),
          "409": errorResponse("The Offering is not a Draft"),
          "422": errorResponse(
            "The Offering does not satisfy the Universal Publication Minimum"
          )
        },
        tags: ["Offering"]
      }
    },
    "/api/v1/businesses/{businessId}/offerings/{offeringId}/retirement": {
      post: {
        description:
          "Owner retirement to Archived, the only V1 transition out of Draft, Published or Hidden. It is not deletion: the Category, derived Domain and Attribute values are kept as history. An Archived Offering cannot be retired again, edited or restored.",
        operationId: "retireOffering",
        parameters: [
          {
            in: "path",
            name: "businessId",
            required: true,
            schema: { format: "uuid", type: "string" }
          },
          {
            in: "path",
            name: "offeringId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OfferingContent" }
              }
            },
            description: "Offering archived"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "Account is not active, or the request origin is not allowed"
          ),
          "404": errorResponse("No owned Offering matches that identifier"),
          "409": errorResponse("The Offering is already Archived")
        },
        tags: ["Offering"]
      }
    },
    "/api/v1/businesses/{businessId}/offerings/{offeringId}/affiliate-destination/management":
      {
        get: {
          description:
            "The Business-side Affiliate Destination management entry for one owned Offering: the destination if there is one, `null` if there is not, and the entries currently permitted. Reports PRD-0001's status, validation result and Handoff Eligibility without recalculating any of them. Review, Validate, Enable and Disable are not entries a Business may hold.",
          operationId: "getDestinationManagementEntry",
          parameters: [
            {
              in: "path",
              name: "businessId",
              required: true,
              schema: { format: "uuid", type: "string" }
            },
            {
              in: "path",
              name: "offeringId",
              required: true,
              schema: { format: "uuid", type: "string" }
            }
          ],
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/DestinationManagementEntry"
                  }
                }
              },
              description: "Affiliate Destination management entry"
            },
            "400": errorResponse("Invalid identifier"),
            "401": errorResponse("Authentication required"),
            "404": errorResponse("No owned Offering matches")
          },
          tags: ["Offering"]
        }
      },
    "/api/v1/businesses/{businessId}/offerings/{offeringId}/affiliate-destination":
      {
        get: {
          description:
            "The destination's current status, validation result and Handoff Eligibility. Readable for every lifecycle state, an Archived Offering included.",
          operationId: "getAffiliateDestination",
          parameters: [
            {
              in: "path",
              name: "businessId",
              required: true,
              schema: { format: "uuid", type: "string" }
            },
            {
              in: "path",
              name: "offeringId",
              required: true,
              schema: { format: "uuid", type: "string" }
            }
          ],
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/AffiliateDestination"
                  }
                }
              },
              description: "Affiliate Destination"
            },
            "400": errorResponse("Invalid identifier"),
            "401": errorResponse("Authentication required"),
            "404": errorResponse(
              "No owned Offering or Affiliate Destination matches"
            )
          },
          tags: ["Offering"]
        },
        post: {
          description:
            "Creates the one Affiliate Destination an Offering may have, for a Draft, Published or Hidden Offering. It begins Draft, Not Validated and Ineligible.",
          operationId: "createAffiliateDestination",
          parameters: [
            {
              in: "path",
              name: "businessId",
              required: true,
              schema: { format: "uuid", type: "string" }
            },
            {
              in: "path",
              name: "offeringId",
              required: true,
              schema: { format: "uuid", type: "string" }
            }
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorAffiliateDestination"
                }
              }
            },
            required: true
          },
          responses: {
            "201": {
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/AffiliateDestination"
                  }
                }
              },
              description: "Affiliate Destination created"
            },
            "400": errorResponse("Invalid Affiliate Destination"),
            "401": errorResponse("Authentication required"),
            "403": errorResponse(
              "The Offering is Archived, the Business is Restricted, or the request origin is not allowed"
            ),
            "404": errorResponse("No owned Offering matches that identifier"),
            "409": errorResponse("This Offering already has a destination")
          },
          tags: ["Offering"]
        },
        put: {
          description:
            "Saves a new reference. The destination returns to Draft, Not Validated and Ineligible whatever it was before, so an earlier validation cannot remain authoritative for a changed configuration.",
          operationId: "editAffiliateDestination",
          parameters: [
            {
              in: "path",
              name: "businessId",
              required: true,
              schema: { format: "uuid", type: "string" }
            },
            {
              in: "path",
              name: "offeringId",
              required: true,
              schema: { format: "uuid", type: "string" }
            }
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorAffiliateDestination"
                }
              }
            },
            required: true
          },
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/AffiliateDestination"
                  }
                }
              },
              description: "Affiliate Destination saved"
            },
            "400": errorResponse("Invalid Affiliate Destination"),
            "401": errorResponse("Authentication required"),
            "403": errorResponse(
              "The Offering is Archived, the Business is Restricted, or the request origin is not allowed"
            ),
            "404": errorResponse(
              "No owned Offering or Affiliate Destination matches"
            )
          },
          tags: ["Offering"]
        }
      },
    "/api/v1/admin/offerings/{offeringId}": {
      get: {
        description:
          "An authorized Admin's read of an Offering as a historical record. There is no Admin write here: an Admin cannot archive an Offering in V1.",
        operationId: "getOfferingForAdmin",
        parameters: [
          {
            in: "path",
            name: "offeringId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OfferingContent" }
              }
            },
            description: "Offering content"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("An entered Admin context is required"),
          "404": errorResponse("No Offering matches that identifier")
        },
        tags: ["Offering"]
      }
    },
    "/api/v1/admin/offerings/{offeringId}/concealment": {
      post: {
        description:
          "Hide Offering. Available only for a Published Offering, and applies PRD-0001's `Published → Hidden` transition. Public eligibility is re-evaluated rather than asserted, and the Offering leaves Discovery. It changes no Business Moderation Status, User Account access status, Affiliate Destination status, validation result or Handoff Eligibility, and closes no moderation case. There is no Archive, Archived-restore, Hidden-to-Draft or Draft-publication action anywhere: Platform does not have those transitions.",
        operationId: "hideOffering",
        parameters: [
          {
            in: "path",
            name: "offeringId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OfferingContent" }
              }
            },
            description: "The Hidden Offering"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required"),
          "404": errorResponse("No Offering matches that identifier"),
          "409": errorResponse("Only a Published Offering may be hidden")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/offerings/{offeringId}/restoration": {
      post: {
        description:
          "Restore Offering. Available only for a Hidden Offering, and applies PRD-0001's `Hidden → Published` transition. Returning the lifecycle to Published promises nothing about public eligibility: it is composed from every authoritative input, so a restored Offering belonging to a Restricted Business stays publicly ineligible and out of Discovery. Initial publication time is unchanged, and no unrelated state moves.",
        operationId: "restoreOffering",
        parameters: [
          {
            in: "path",
            name: "offeringId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OfferingContent" }
              }
            },
            description: "The restored Offering"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required"),
          "404": errorResponse("No Offering matches that identifier"),
          "409": errorResponse("Only a Hidden Offering may be restored")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/offerings/affiliate-destinations/workload": {
      get: {
        description:
          "Every Affiliate Destination with the work still owed on it. `Needs Validation` is Draft plus Not Validated, `Business Correction Needed` is Draft plus Invalid, and `Ready to Enable` is Draft plus Valid; an Enabled or Disabled destination has had its decision taken and produces no pending item. The category is derived on every read from those two authoritative results and is stored nowhere — it is a way of looking at a destination, not a state it can be in, so it creates no new Affiliate Destination state and cannot go stale. Oldest first.",
        operationId: "listDestinationWorkload",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DestinationWorkload" }
              }
            },
            description: "The Affiliate Destination workload"
          },
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/offerings/{offeringId}/affiliate-destination": {
      get: {
        description:
          "An authorized Admin's view of the destination, its current validation result and its Handoff Eligibility.",
        operationId: "getAffiliateDestinationForAdmin",
        parameters: [adminOfferingParameter],
        responses: {
          "200": affiliateDestinationResponse("Affiliate Destination"),
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("An entered Admin context is required"),
          "404": errorResponse("No Affiliate Destination matches that Offering")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/offerings/{offeringId}/affiliate-destination/review": {
      post: {
        description:
          "Records an approved Admin review. Changes no destination status, no validation result and no Handoff Eligibility by itself.",
        operationId: "reviewAffiliateDestination",
        parameters: [adminOfferingParameter],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ReviewAffiliateDestination"
              }
            }
          },
          required: true
        },
        responses: {
          "200": affiliateDestinationResponse("Review recorded"),
          "400": errorResponse("Invalid review"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "An entered Admin context is required, or the request origin is not allowed"
          ),
          "404": errorResponse("No Affiliate Destination matches that Offering")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/offerings/{offeringId}/affiliate-destination/validation": {
      post: {
        description:
          "Produces exactly one current validation result. Leaves the destination status unchanged; a Valid result stays Ineligible until the destination is enabled.",
        operationId: "validateAffiliateDestination",
        parameters: [adminOfferingParameter],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ValidateAffiliateDestination"
              }
            }
          },
          required: true
        },
        responses: {
          "200": affiliateDestinationResponse("Validation result recorded"),
          "400": errorResponse("Invalid validation result"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "An entered Admin context is required, or the request origin is not allowed"
          ),
          "404": errorResponse("No Affiliate Destination matches that Offering")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/offerings/{offeringId}/affiliate-destination/enablement": {
      post: {
        description:
          "Enables a Valid destination, producing Enabled and Eligible. Refused for any other validation result.",
        operationId: "enableAffiliateDestination",
        parameters: [adminOfferingParameter],
        responses: {
          "200": affiliateDestinationResponse("Destination enabled"),
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "An entered Admin context is required, or the request origin is not allowed"
          ),
          "404": errorResponse(
            "No Affiliate Destination matches that Offering"
          ),
          "409": errorResponse("The destination is not Valid")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/offerings/{offeringId}/affiliate-destination/disablement": {
      post: {
        description:
          "Disables an Enabled destination, producing Disabled and Ineligible. The current validation result is preserved.",
        operationId: "disableAffiliateDestination",
        parameters: [adminOfferingParameter],
        responses: {
          "200": affiliateDestinationResponse("Destination disabled"),
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "An entered Admin context is required, or the request origin is not allowed"
          ),
          "404": errorResponse(
            "No Affiliate Destination matches that Offering"
          ),
          "409": errorResponse("The destination is not Enabled")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/decision/flows": {
      post: {
        description:
          "Enters Decision with one eligible Offering or the Comparison Set Compare built. Public and unauthenticated. Compare is not required: a person who has read one Offering has a complete Decision Context. The flow expires and carries no person, so no personal Decision history can exist.",
        operationId: "enterDecision",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EnterDecision" }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DecisionContext" }
              }
            },
            description: "The Decision Context"
          },
          "400": errorResponse(
            "A Decision Context is one Offering or one Comparison Set"
          ),
          "404": errorResponse(
            "That Comparison Set has expired or never existed"
          )
        },
        tags: ["Decision"]
      }
    },
    "/api/v1/decision/flows/{decisionFlowId}": {
      get: {
        description:
          "The context with its validity decided now. An Offering retired since the person entered reports the context invalid rather than continuing to look usable, and is not returned in a diminished form that Chat could still quote.",
        operationId: "decisionContext",
        parameters: [
          {
            in: "path",
            name: "decisionFlowId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DecisionContext" }
              }
            },
            description: "The current Decision Context"
          },
          "400": errorResponse("Invalid identifier"),
          "404": errorResponse(
            "That Decision flow has expired or never existed"
          )
        },
        tags: ["Decision"]
      }
    },
    "/api/v1/decision/flows/{decisionFlowId}/completion": {
      get: {
        description:
          "The Completions this flow reached. A read and only a read: no further confirmation is asked for, and nothing is written to produce one. The same meaning applies in every Domain — nothing on this path consults a Category or a Domain.",
        operationId: "decisionCompletion",
        parameters: [
          {
            in: "path",
            name: "decisionFlowId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DecisionCompletions" }
              }
            },
            description: "The Completions reached, each on its own"
          },
          "400": errorResponse("Invalid identifier"),
          "404": errorResponse(
            "That Decision flow has expired or never existed"
          )
        },
        tags: ["Decision"]
      }
    },
    "/api/v1/decision/flows/{decisionFlowId}/direct-contact": {
      get: {
        description:
          "Which Direct Contact channels the Selected Offering's Business supplied. Public, and reveals none of them.",
        operationId: "directContactChannels",
        parameters: [
          {
            in: "path",
            name: "decisionFlowId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ContactChannels" }
              }
            },
            description: "The available channels"
          },
          "400": errorResponse("Invalid identifier"),
          "404": errorResponse(
            "That Decision flow has expired or never existed"
          ),
          "422": errorResponse(
            "Nothing is selected, the Offering is no longer publicly eligible, or the Business supplied no channel"
          )
        },
        tags: ["Decision"]
      },
      post: {
        description:
          "Reveals one explicitly chosen approved channel and makes it available. The only Decision route that requires authentication: a Guest is refused and told nothing, and may repeat this exact request unchanged after signing in — which is also how every gate comes to be re-evaluated on return. Requires an Enabled authenticated User, a Selected Offering that is still publicly eligible, and a channel the Business actually supplied. A refusal reveals nothing and records nothing, so no Completion follows it. No message, inbox, conversation, reply, delivery, answer, Business-response state or external-success confirmation is created.",
        operationId: "revealDirectContact",
        parameters: [
          {
            in: "path",
            name: "decisionFlowId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RevealContact" }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DirectContactReveal" }
              }
            },
            description: "The revealed channel"
          },
          "400": errorResponse("Choose one available contact channel"),
          "401": errorResponse("Authentication required"),
          /*
           * The only Decision operation that calls `OriginValidator` — a reveal
           * carries a session, so ADR-0012 §2 applies and a request without an
           * acceptable `Origin` is refused before anything else runs.
           *
           * **Undeclared until I44**, which found it by driving the operation
           * rather than by reading either side.
           */
          "403": errorResponse(
            "The request did not declare an acceptable origin"
          ),
          "404": errorResponse(
            "That Decision flow has expired or never existed"
          ),
          "422": errorResponse(
            "Nothing is selected, the Offering is no longer publicly eligible, the Business supplied no channel, or that channel is not available"
          )
        },
        tags: ["Decision"]
      }
    },
    "/api/v1/decision/flows/{decisionFlowId}/affiliate-handoff": {
      post: {
        description:
          "Initiates an Affiliate Handoff for the current Selected Offering. Public and unauthenticated: no Registration is required before or after, and none is created. Both eligibility results are read rather than recalculated — final Offering Public Eligibility must be Eligible and the Affiliate Destination's Handoff Eligibility must be Eligible. A refusal records nothing, so no Completion follows it. No Favorites, Messaging, personal Decision history, destination-authoring state or external-success claim is created, and no attribution or tracking is attached.",
        operationId: "initiateAffiliateHandoff",
        parameters: [
          {
            in: "path",
            name: "decisionFlowId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AffiliateHandoff" }
              }
            },
            description: "The initiated handoff and its destination"
          },
          "400": errorResponse("Invalid identifier"),
          "404": errorResponse(
            "That Decision flow has expired or never existed"
          ),
          "422": errorResponse(
            "Nothing is selected, the Offering is no longer publicly eligible, or it has no eligible Affiliate Destination"
          )
        },
        tags: ["Decision"]
      }
    },
    "/api/v1/decision/flows/{decisionFlowId}/selection": {
      put: {
        description:
          "States the Selected Offering, including that it is nothing. Every handoff waits for one: no Affiliate Handoff or Direct Contact is available until a current eligible Selected Offering exists. In a single-Offering context the only selectable Offering is that one; in a Comparison Set context it must be a current member, and selecting one leaves every other member in the set. A selection whose Offering stops being eligible, or whose member is removed from the set, clears itself.",
        operationId: "selectOffering",
        parameters: [
          {
            in: "path",
            name: "decisionFlowId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SelectOffering" }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DecisionContext" }
              }
            },
            description: "The Decision Context after the selection"
          },
          "400": errorResponse("Invalid selection"),
          "404": errorResponse(
            "That Decision flow has expired or never existed"
          ),
          "422": errorResponse(
            "Select an Offering from the current Decision Context"
          )
        },
        tags: ["Decision"]
      }
    },
    "/api/v1/decision/flows/{decisionFlowId}/chat": {
      get: {
        description: "The conversation so far, for this flow only.",
        operationId: "decisionChatHistory",
        parameters: [
          {
            in: "path",
            name: "decisionFlowId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DecisionChat" }
              }
            },
            description: "The current conversation"
          },
          "400": errorResponse("Invalid identifier"),
          "404": errorResponse(
            "That Decision flow has expired or never existed"
          )
        },
        tags: ["Decision"]
      },
      post: {
        description:
          "Asks a question about the current Decision Context. Public to a Guest, an Enabled User, a Business context, an Admin context and a Suspended account through its Guest baseline — no principal is resolved, and no account is required or created. The assistant is given a brief built only from the Decision Context: it holds no telephone number, email address, contact URL or Affiliate Destination, so none can be revealed. The first question on a valid context produces one Decision Chat Start. A reply stating a figure the brief did not contain is withheld rather than delivered. Nothing here selects an Offering, begins a handoff, chooses a contact channel or claims a purchase, sale or external success.",
        operationId: "askDecision",
        parameters: [
          {
            in: "path",
            name: "decisionFlowId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AskDecision" }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DecisionChat" }
              }
            },
            description: "The conversation including the new turn"
          },
          "400": errorResponse("Invalid question"),
          "404": errorResponse(
            "That Decision flow has expired or never existed"
          ),
          "422": errorResponse(
            "The Decision Context is not currently valid, or the reply would have stated something the context did not contain"
          )
        },
        tags: ["Decision"]
      }
    },
    "/api/v1/businesses/{businessId}/dashboard": {
      get: {
        description:
          "The owner's Dashboard for one Business. The Business is named in the path rather than taken from the selected context, so no management read depends on state the request never mentioned. Enabled status and exact ownership are re-evaluated on every read.",
        operationId: "businessDashboard",
        parameters: [
          {
            in: "path",
            name: "businessId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BusinessDashboard" }
              }
            },
            description: "The Dashboard"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Account is not active"),
          "404": errorResponse("No owned Business matches that identifier")
        },
        tags: ["Business"]
      }
    },
    "/api/v1/admin/analytics": {
      get: {
        description:
          'Basic Analytics: operational visibility, not analytics. Periods are exactly Today, Last 7 days, Last 30 days and All time; there is no custom range. Current-state indicators are counted as they stand now, because "how many Businesses are Restricted" is not an occurrence a window could bound. Core-flow indicators are counted within the period, and a Domain breakdown appears only where the owning source records one — a Search Discovery Start with no selected leaf Category has no Domain, and no Domain is inferred from free-text, so that breakdown deliberately does not sum to its total. Affiliate Handoff Completion and Direct Contact Completion are separate figures named for what they are; neither is a purchase, sale, contract, reply or external success, and there is no combined figure in which either could be read as one. Nothing here writes anything.',
        operationId: "getBasicAnalytics",
        parameters: [
          {
            in: "query",
            name: "period",
            required: false,
            schema: {
              enum: ["TODAY", "LAST_7_DAYS", "LAST_30_DAYS", "ALL_TIME"],
              type: "string"
            }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Analytics" }
              }
            },
            description: "The Basic Analytics snapshot"
          },
          "400": errorResponse("Invalid analytics period"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/panel": {
      get: {
        description:
          "The Admin Panel baseline. Opens only for an Enabled account with a live Admin authorization that has explicitly entered Admin context, and re-evaluates all three on every request — an authorization removed a moment ago closes the Panel on the next read rather than at the next sign-in. `functions` lists only Platform behaviour that exists today: no grant, remove, transfer, delegate or tier-management action is a member, because first-Admin establishment and authorization changes are Product Owner decisions taken outside the Panel. `ownedBusinessIds` states what this account owns in its own right, which Admin authorization neither creates nor extends.",
        operationId: "getAdminPanel",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminPanel" }
              }
            },
            description: "The Admin Panel baseline"
          },
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/audit-events": {
      get: {
        description:
          "The Admin audit trail (I84). Reserved to the platform\u0027s own administrator: every route here resolves a super-admin principal rather than an ordinary Admin one. The two are the same check today because there is one Admin tier, and they are different names so that a later revision adding Sub-Admins changes one place rather than silently widening access to the log that exists to watch Admins. Filtered by actor, action and date, and paged with an offset — unlike the report queue, which is work to be emptied; this is a record being searched, and a record you cannot page through is one you cannot audit.",
        operationId: "listAuditEvents",
        parameters: [
          {
            in: "query",
            name: "actorId",
            required: false,
            schema: { format: "uuid", type: "string" }
          },
          {
            in: "query",
            name: "action",
            required: false,
            schema: {
              enum: [
                "PII_VIEW",
                "REQUEST_CORRECTION",
                "HIDE_OFFERING",
                "RESTORE_OFFERING",
                "RESTRICT_BUSINESS",
                "RESTORE_BUSINESS",
                "SUSPEND_USER",
                "REINSTATE_USER",
                "CASE_OPEN",
                "REVIEW_DESTINATION",
                "VALIDATE_DESTINATION_VALID",
                "VALIDATE_DESTINATION_INVALID",
                "ENABLE_DESTINATION",
                "DISABLE_DESTINATION"
              ],
              type: "string"
            }
          },
          {
            in: "query",
            name: "from",
            required: false,
            schema: { format: "date-time", type: "string" }
          },
          {
            in: "query",
            name: "to",
            required: false,
            schema: { format: "date-time", type: "string" }
          },
          {
            in: "query",
            name: "offset",
            required: false,
            schema: { minimum: 0, type: "integer" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminAuditEvents" }
              }
            },
            description: "One page of the trail"
          },
          "400": errorResponse("Invalid audit filter"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/products/{productKey}/editorial-review": {
      get: {
        description:
          "The platform's own judgement of a product (I93, `EDT F01`). Keyed by Product Key rather than by listing, so every seller of one product presents the same review and it survives any of them withdrawing (`US-EDT-F01-001` AC-8, AC-9). Fetched separately from the Offering presentation on purpose: `UX-0003` §8.9.2 requires absence and outage to be different answers, and a review folded into the presentation could only report a read failure as `null` — the claim 'there is no review', which that section forbids. A `200` carrying `review: null` means the product has none.",
        operationId: "readEditorialReview",
        parameters: [
          {
            in: "path",
            name: "productKey",
            required: true,
            schema: { maxLength: 64, minLength: 1, type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EditorialReviewView" }
              }
            },
            description: "The review of this Product Key, or none"
          },
          "403": errorResponse("Origin not acceptable"),
          "503": errorResponse("Dependency unavailable")
        },
        tags: ["Offering"]
      }
    },
    "/api/v1/admin/editorial-reviews": {
      get: {
        description:
          "Every editorial review, newest first (I93, `EDT F02`). Carries `lastCheckedAt` so a surface can show each review's age (`PRD-0009` §13.7). No screen presents it yet: no UX document describes the Admin authoring surface, and `US-EDT-F02-001`'s Freeze Note forbids building one until that screen is drawn in the prototype's language and approved.",
        operationId: "listEditorialReviews",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EditorialReviewList" }
              }
            },
            description: "Every editorial review"
          },
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required"),
          "503": errorResponse("Dependency unavailable")
        },
        tags: ["Platform"]
      },
      post: {
        description:
          "Create an editorial review for a Product Key, as a Draft (`US-EDT-F02-001` AC-14, AC-15). The key must be one the catalogue carries, checked inside the write transaction rather than by a foreign key — AC-14 wants the key to exist now and AC-9 wants the review to outlive every listing that carried it, and a foreign key would serve the first by defeating the second. A key that already carries a review is refused in every state, withdrawn included.",
        operationId: "createEditorialReview",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WriteEditorialReview" }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EditorialReviewAdmin" }
              }
            },
            description: "The review, as a Draft"
          },
          "400": errorResponse("Invalid editorial review"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required"),
          "409": errorResponse("That Product Key already carries a review"),
          "422": errorResponse("No published listing carries that Product Key"),
          "503": errorResponse("Dependency unavailable")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/editorial-reviews/{productKey}": {
      get: {
        description:
          "The review as its writer sees it, in whatever state it is in.",
        operationId: "readEditorialReviewForWriter",
        parameters: [
          {
            in: "path",
            name: "productKey",
            required: true,
            schema: { maxLength: 64, minLength: 1, type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EditorialReviewAdmin" }
              }
            },
            description: "The review"
          },
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required"),
          "404": errorResponse("No review exists for that Product Key"),
          "503": errorResponse("Dependency unavailable")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/editorial-reviews/{id}": {
      put: {
        description:
          "Save a Draft, or revise a published review. **Moves neither date a reader is shown** (`PRD-0009` §13.4, AC-9, AC-11): the body has no field for either and the update does not name them, so a writer who fixes a comma leaves 'last re-checked' where it was. Re-checking is a separate act with its own route.",
        operationId: "saveEditorialReview",
        parameters: [adminEditorialParameter],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WriteEditorialDraft" }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EditorialReviewAdmin" }
              }
            },
            description: "The saved review"
          },
          "400": errorResponse("Invalid editorial review"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required"),
          "422": errorResponse("A published review may not be left incomplete"),
          "503": errorResponse("Dependency unavailable")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/editorial-reviews/{id}/publication": {
      post: {
        description:
          "Publish a review (AC-12). Refused unless it carries a verdict, a score, at least one section, at least one pro, at least one con and a byline — `PRD-0009` §5's rule that a review with no cons is an advertisement. The first publication date is set once and kept across a withdrawal and a return (AC-8).",
        operationId: "publishEditorialReview",
        parameters: [adminEditorialParameter],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EditorialReviewAdmin" }
              }
            },
            description: "The published review"
          },
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required"),
          "409": errorResponse(
            "The review is not in a state that can be published"
          ),
          "422": errorResponse(
            "The review is missing parts it cannot publish without"
          ),
          "503": errorResponse("Dependency unavailable")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/editorial-reviews/{id}/recheck": {
      post: {
        description:
          "Record that a published review has been re-checked — the only act that moves `lastCheckedAt` (`PRD-0009` §13.4, AC-9, AC-10). It takes no body, because there is nothing to state beyond that the check happened, and a payload would invite a caller to send it alongside a save.",
        operationId: "recheckEditorialReview",
        parameters: [adminEditorialParameter],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EditorialReviewAdmin" }
              }
            },
            description: "The re-checked review"
          },
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required"),
          "409": errorResponse("Only a published review can be re-checked"),
          "503": errorResponse("Dependency unavailable")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/editorial-reviews/{id}/withdrawal": {
      post: {
        description:
          "Withdraw a published review (AC-6, AC-7). Not a deletion, and there is no route that is one: the review stops being presented, and that it existed and who withdrew it stays in the audit trail. Withdrawal exists so that removing a wrong judgement is not a database operation.",
        operationId: "withdrawEditorialReview",
        parameters: [adminEditorialParameter],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EditorialReviewAdmin" }
              }
            },
            description: "The withdrawn review"
          },
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required"),
          "409": errorResponse("Only a published review can be withdrawn"),
          "503": errorResponse("Dependency unavailable")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/audit-events/export": {
      get: {
        description:
          "The same rows as a CSV file, for a security or compliance request (I84). Produced by the server rather than assembled in the browser, so an export can be reproduced identically on demand. Bounded at 10,000 rows; `x-total-count` reports the unbounded total so a reader whose file was truncated can see that it was and narrow the range.",
        operationId: "exportAuditEvents",
        parameters: [
          {
            in: "query",
            name: "actorId",
            required: false,
            schema: { format: "uuid", type: "string" }
          },
          {
            in: "query",
            name: "action",
            required: false,
            schema: {
              enum: [
                "PII_VIEW",
                "REQUEST_CORRECTION",
                "HIDE_OFFERING",
                "RESTORE_OFFERING",
                "RESTRICT_BUSINESS",
                "RESTORE_BUSINESS",
                "SUSPEND_USER",
                "REINSTATE_USER",
                "CASE_OPEN",
                "REVIEW_DESTINATION",
                "VALIDATE_DESTINATION_VALID",
                "VALIDATE_DESTINATION_INVALID",
                "ENABLE_DESTINATION",
                "DISABLE_DESTINATION"
              ],
              type: "string"
            }
          },
          {
            in: "query",
            name: "from",
            required: false,
            schema: { format: "date-time", type: "string" }
          },
          {
            in: "query",
            name: "to",
            required: false,
            schema: { format: "date-time", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: { "text/csv": { schema: { type: "string" } } },
            description: "The filtered rows as CSV"
          },
          "400": errorResponse("Invalid audit filter"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/user-accounts": {
      get: {
        description:
          "The register of User Accounts (I83). Opened so that Suspend and Reinstate are reachable at all: their routes have existed since US-PLT-F05-001 and could only be triggered from a USER_ACCOUNT Moderation Case, which nothing in the panel could create. **Carries no email address for anybody** — the Owner\u0027s PII rule keeps addresses out of operational lists, and the schema has nowhere to put one. The address is reachable only on a case, behind an explicit reveal, recorded in the audit trail. A fixed page with the total beside it, like every other Admin list.",
        operationId: "listUserAccounts",
        parameters: [
          {
            in: "query",
            name: "status",
            required: false,
            schema: {
              enum: ["ENABLED", "PENDING_VERIFICATION", "SUSPENDED"],
              type: "string"
            }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminUserAccounts" }
              }
            },
            description: "The register"
          },
          "400": errorResponse("Invalid account status"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/user-accounts/{userId}/suspension": {
      post: {
        description:
          "Suspend User. Available to an ordinary Admin only for an Enabled account that carries no Admin authorization, and applies PRD-0003's `Enabled → Suspended` transition. An Admin-authorized account is refused whatever state it is in: only the Product Owner may suspend one, through a controlled operational process outside this surface. Suspension removes no Admin authorization and changes no Business Moderation Status, Offering lifecycle, Affiliate Destination result or public eligibility — the account was moderated, not anything it owns.",
        operationId: "suspendUserAccount",
        parameters: [
          {
            in: "path",
            name: "userId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserAccess" }
              }
            },
            description: "The suspended account"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "Admin context required, or the target carries Admin authorization"
          ),
          "404": errorResponse("No User Account matches that identifier"),
          "409": errorResponse("Only an Enabled account may be suspended")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/user-accounts/{userId}/reinstatement": {
      post: {
        description:
          "Reinstate User. Available to an ordinary Admin only for a Suspended account that carries no Admin authorization, and applies PRD-0003's `Suspended → Enabled` transition. Reinstatement restores nothing else: no Business is un-restricted, no Offering is republished and no eligibility is recomposed by it.",
        operationId: "reinstateUserAccount",
        parameters: [
          {
            in: "path",
            name: "userId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserAccess" }
              }
            },
            description: "The reinstated account"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "Admin context required, or the target carries Admin authorization"
          ),
          "404": errorResponse("No User Account matches that identifier"),
          "409": errorResponse("Only a Suspended account may be reinstated")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/moderation-cases": {
      get: {
        description:
          "General Moderation cases, optionally filtered by workflow status. A case carries no target product state at all — no Offering lifecycle, moderation status, access status, eligibility or validation result — because case status is workflow and is not any of those.",
        operationId: "listModerationCases",
        parameters: [
          {
            in: "query",
            name: "status",
            required: false,
            schema: { enum: ["OPEN", "CLOSED"], type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ModerationCases" }
              }
            },
            description: "General Moderation cases"
          },
          "400": errorResponse("Invalid case status"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required")
        },
        tags: ["Platform"]
      },
      post: {
        description:
          "Surfaces a General Moderation case for one target, which produces an Open case. A target that already has an Open case is answered with that case rather than a second one: one concern is one case. Opening changes no target lifecycle, moderation, access, visibility, eligibility or validation state.",
        operationId: "openModerationCase",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OpenModerationCase" }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ModerationCase" }
              }
            },
            description: "The Open case"
          },
          "400": errorResponse("Invalid moderation case target"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required"),
          "404": errorResponse("No target matches that identifier")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/moderation-cases/{caseId}": {
      get: {
        description: "One General Moderation case.",
        operationId: "getModerationCase",
        parameters: [
          {
            in: "path",
            name: "caseId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ModerationCase" }
              }
            },
            description: "The case"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required"),
          "404": errorResponse("No case matches that identifier")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/moderation-cases/{caseId}/target-email": {
      post: {
        description:
          "Reveals the email address of a User Account case's target (I82). A POST rather than a GET although it changes nothing: the Owner's rule makes revealing an address an action that can be attached to an audit trail, and GET is what proxies cache, browsers prefetch and reloads repeat. The address is deliberately absent from the case itself and from every list, so that it travels only when an Admin asks for it on the case they are working. 404 both for a case that is not a User Account case and for one that does not exist, so this cannot be used to learn which case ids exist.",
        operationId: "revealModerationCaseTargetEmail",
        parameters: [
          {
            in: "path",
            name: "caseId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CaseTargetEmail" }
              }
            },
            description: "The target's email address"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required"),
          "404": errorResponse("No User Account case matches that identifier")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/moderation-cases/{caseId}/no-action-decision": {
      post: {
        description:
          "Records that an Admin reviewed the case and decided nothing needs doing. It carries a reason and nothing else, because deciding to do nothing is still a decision somebody stands behind. Recording it changes no target state and does not close the case.",
        operationId: "recordNoActionDecision",
        parameters: [
          {
            in: "path",
            name: "caseId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RecordNoAction" }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ModerationCase" }
              }
            },
            description: "The case with the decision recorded"
          },
          "400": errorResponse("Invalid no-action decision"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required"),
          "404": errorResponse("No case matches that identifier")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/moderation-cases/{caseId}/re-review": {
      post: {
        description:
          "Records that an Admin re-reviewed the owner's correction response. Where the owner has saved a correction, closure is refused until a re-review dated after that response exists — an earlier review cannot stand in for a later answer. Recording one changes no target state and closes nothing; what it changes is what closure will accept.",
        operationId: "recordReReview",
        parameters: [
          {
            in: "path",
            name: "caseId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RecordReReview" }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ModerationCase" }
              }
            },
            description: "The case with the re-review recorded"
          },
          "400": errorResponse("Invalid re-review"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required"),
          "404": errorResponse("No case matches that identifier")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/moderation-cases/{caseId}/closure": {
      post: {
        description:
          "Closes the case explicitly. Permitted only after an approved action has been applied within the case or a no-action decision has been recorded — Request Correction is not one of those, because it keeps the case Open for re-review. Closing creates no target-state result, and a refused closure leaves the case exactly Open.",
        operationId: "closeModerationCase",
        parameters: [
          {
            in: "path",
            name: "caseId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ModerationCase" }
              }
            },
            description: "The Closed case"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required"),
          "404": errorResponse("No case matches that identifier"),
          "409": errorResponse(
            "The case has no approved action or recorded no-action decision, or the owner's correction has not been re-reviewed"
          )
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/businesses/{businessId}/correction-notices": {
      get: {
        description:
          "The owner's correction notices. Each identifies the exact approved target area and, where the owner is currently authorized for it, the management area it opens. Reading a notice changes nothing: no lifecycle, moderation, access, exposure, eligibility, validation or case state. There is no reply, acknowledgement or dismissal route, because Request Correction creates no Messaging.",
        operationId: "listCorrectionNotices",
        parameters: [
          {
            in: "path",
            name: "businessId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CorrectionNotices" }
              }
            },
            description: "Correction notices"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "404": errorResponse("No owned Business matches that identifier")
        },
        tags: ["Business"]
      }
    },
    "/api/v1/businesses/{businessId}/correction-notices/{correctionId}/response":
      {
        put: {
          description:
            "The bounded correction-edit path. Available only for an Open case targeting Offering content on a Published or Hidden Offering the acting User owns, and limited to the exact Offering and the exact targeted content area. The saved result must keep the Universal Publication Minimum satisfied. It grants no Offering creation, no Draft publication, no unrelated or untargeted edit, no lifecycle change, no moderation-status or exposure-input change, no public eligibility and no case closure: the case stays Open and Platform re-review is required.",
          operationId: "saveCorrectionResponse",
          parameters: [
            {
              in: "path",
              name: "businessId",
              required: true,
              schema: { format: "uuid", type: "string" }
            },
            {
              in: "path",
              name: "correctionId",
              required: true,
              schema: { format: "uuid", type: "string" }
            }
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SaveCorrection" }
              }
            },
            required: true
          },
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/OfferingContent" }
                }
              },
              description: "The Offering after the bounded correction"
            },
            "400": errorResponse("Invalid correction response"),
            "401": errorResponse("Authentication required"),
            "403": errorResponse(
              "The notice did not identify that content area"
            ),
            "404": errorResponse("No Offering-content correction matches"),
            "409": errorResponse(
              "The bounded path requires an Open case and a Published or Hidden Offering"
            ),
            "422": errorResponse(
              "The saved correction would leave the Offering below the Universal Publication Minimum"
            )
          },
          tags: ["Business"]
        }
      },
    "/api/v1/admin/businesses/{businessId}/correction-requests": {
      post: {
        description:
          "Records Request Correction against a Business-owned target. Opens a General Moderation Case if none is Open, or joins the Open one. Targets are exactly Business Information, Offering content, Affiliate Destination configuration and Direct Contact information; User Account correction is outside V1 and is not a value this accepts. An Offering-content request carries the exact Offering and content area, and no other target may carry either. Recording it changes no lifecycle, moderation, access, exposure, eligibility, validation or case state, and creates no message, conversation, ticket discussion, reply or inbox. Re-review, approved action, no-action decision and case closure are not offered here.",
        operationId: "requestCorrection",
        parameters: [
          {
            in: "path",
            name: "businessId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RequestCorrection" }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CorrectionNotice" }
              }
            },
            description: "The recorded correction notice"
          },
          "400": errorResponse("Invalid correction request"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required"),
          "404": errorResponse("No Business matches that identifier")
        },
        tags: ["Business"]
      }
    },
    "/api/v1/admin/businesses/{businessId}/restriction": {
      post: {
        description:
          "Applies an approved Restrict Business action. Moderation Status becomes Restricted and Business Public Exposure Input becomes Ineligible — the two are one mapping the database keeps, not two fields a caller sets. The Business's Offerings stop being publicly eligible, and nothing else moves: no Offering lifecycle, no Affiliate Destination status or validation result, no User Account access status and no ownership. The owner keeps Business Information, existing Drafts, viewing what they own, retirement, and Affiliate Destinations on Offerings that are still owner-manageable; they lose creating an Offering, publishing a Draft and normally editing a Published or Hidden one.",
        operationId: "restrictBusiness",
        parameters: [
          {
            in: "path",
            name: "businessId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OwnedBusiness" }
              }
            },
            description: "The Business after restriction"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required"),
          "404": errorResponse("No Business matches that identifier"),
          "409": errorResponse(
            "Only an Unrestricted Business may be restricted"
          )
        },
        tags: ["Business"]
      }
    },
    "/api/v1/admin/businesses/{businessId}/restoration": {
      post: {
        description:
          "Applies an approved Restore Business action. Moderation Status becomes Unrestricted and exposure input becomes Eligible. Normal Business-management permissions return, but nothing is published and nothing is un-hidden: only lifecycle-Published Offerings regain final public eligibility, and no Affiliate Destination status or Handoff Eligibility changes because of restoration alone.",
        operationId: "restoreBusiness",
        parameters: [
          {
            in: "path",
            name: "businessId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OwnedBusiness" }
              }
            },
            description: "The Business after restoration"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required"),
          "404": errorResponse("No Business matches that identifier"),
          "409": errorResponse("Only a Restricted Business may be restored")
        },
        tags: ["Business"]
      }
    },
    "/api/v1/decision/comparison-sets": {
      post: {
        description:
          "Begins a Comparison Set from one publicly eligible Offering. Public and unauthenticated: PRD-0003 makes Compare part of a person's decision rather than a feature of an account. The shared active leaf Category is taken from the Offering rather than from the request. Compare is optional — no other route requires a set to exist.",
        operationId: "beginComparisonSet",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddComparisonMember" }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ComparisonSet" }
              }
            },
            description: "The set, holding its first member"
          },
          "400": errorResponse("Invalid Comparison Set request"),
          "422": errorResponse("That Offering is not publicly eligible")
        },
        tags: ["Decision"]
      }
    },
    "/api/v1/decision/comparison-sets/{comparisonSetId}": {
      get: {
        description:
          "The set as it stands. A set that has expired and one that never existed answer identically — current-flow state is allowed to disappear.",
        operationId: "currentComparisonSet",
        parameters: [
          {
            in: "path",
            name: "comparisonSetId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ComparisonSet" }
              }
            },
            description: "The current Comparison Set"
          },
          "400": errorResponse("Invalid identifier"),
          "404": errorResponse(
            "That Comparison Set has expired or never existed"
          )
        },
        tags: ["Decision"]
      }
    },
    "/api/v1/decision/comparison-sets/{comparisonSetId}/members": {
      post: {
        description:
          "Adds one publicly eligible Offering from the shared active leaf Category. At five members the addition is refused unless `replaces` names the member that leaves; the refusal changes nothing about the current set.",
        operationId: "addComparisonMember",
        parameters: [
          {
            in: "path",
            name: "comparisonSetId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddComparisonMember" }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ComparisonSet" }
              }
            },
            description: "The set after the addition"
          },
          "400": errorResponse("Invalid Comparison Set request"),
          "404": errorResponse(
            "That Comparison Set has expired or never existed"
          ),
          "422": errorResponse(
            "The Offering is ineligible, belongs to another leaf Category, or the set is full"
          )
        },
        tags: ["Decision"]
      }
    },
    "/api/v1/decision/comparison-sets/{comparisonSetId}/members/{offeringId}": {
      delete: {
        description:
          "Removes one member. A set may fall to one member or none; neither is invalid, and neither is openable in Compare.",
        operationId: "removeComparisonMember",
        parameters: [
          {
            in: "path",
            name: "comparisonSetId",
            required: true,
            schema: { format: "uuid", type: "string" }
          },
          {
            in: "path",
            name: "offeringId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ComparisonSet" }
              }
            },
            description: "The set after the removal"
          },
          "400": errorResponse("Invalid identifier"),
          "404": errorResponse(
            "That Comparison Set has expired or never existed"
          )
        },
        tags: ["Decision"]
      }
    },
    "/api/v1/decision/comparison-sets/{comparisonSetId}/compare": {
      post: {
        description:
          "Opens a valid set in Compare and produces one Compare Start for it. Reopening the same set produces none — it is the same person still comparing the same things. Only Attributes whose authoritative `comparable` property is enabled appear, an absent value is `null` rather than substituted, and nothing is ranked, scored or recommended.",
        operationId: "openCompare",
        parameters: [
          {
            in: "path",
            name: "comparisonSetId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ComparisonView" }
              }
            },
            description: "The comparison"
          },
          "400": errorResponse("Invalid identifier"),
          "404": errorResponse(
            "That Comparison Set has expired or never existed"
          ),
          "422": errorResponse(
            "Compare needs between two and five eligible Offerings"
          )
        },
        tags: ["Decision"]
      }
    },
    "/api/v1/discovery/browse": {
      get: {
        description:
          "The active root Categories by Domain. Public and unauthenticated. Choosing one begins a Browse path, so nothing is recorded here.",
        operationId: "browseRoots",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BrowseRoots" }
              }
            },
            description: "Active root Categories"
          }
        },
        tags: ["Discovery"]
      }
    },
    "/api/v1/discovery/search": {
      post: {
        description:
          "Submits a Search query. A valid submission creates a Search Discovery Start, which carries no Domain until the criteria include one selected active leaf Category. Matching considers only title, description, active Category-path display names, public Business display name and public Attribute display values — protected contact, Affiliate Destination, owner-only and Admin-only information, historical records and ineligible Offerings are not in the set at all. Behaviour is identical with or without a session.",
        operationId: "search",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SearchSubmission" }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SearchView" }
              }
            },
            description: "Matched Offerings with their highest match level"
          },
          "400": errorResponse("Invalid Search submission"),
          "404": errorResponse(
            "No active leaf Category matches the narrowing identifier"
          ),
          "422": errorResponse(
            "A Filter was applied outside an active leaf Category, or names an Attribute that is not a Filter here"
          )
        },
        tags: ["Discovery"]
      }
    },
    "/api/v1/discovery/browse/categories/{categoryId}": {
      post: {
        description:
          "Selects an active Category. The first selection of a path creates a Discovery Start carrying the Category's Domain; a request that carries a path identifier continues that path and creates none. Results appear only for an active leaf. Retired Categories are absent rather than refused.",
        operationId: "browseCategory",
        parameters: [
          {
            in: "path",
            name: "categoryId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BrowseSelection" }
            }
          },
          required: false
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BrowseView" }
              }
            },
            description: "The current point in the Browse path"
          },
          "400": errorResponse("Invalid identifier or Browse selection"),
          "404": errorResponse("No active Category matches that identifier"),
          "422": errorResponse(
            "A Filter was applied to a non-leaf Category, or names an Attribute that is not a Filter here"
          )
        },
        tags: ["Discovery"]
      }
    },
    "/api/v1/offerings/{slug}": {
      get: {
        description:
          "The complete public Presentation of one Offering, reached by opening a Listing Card. Public and unauthenticated. It reads the Discovery projection, so it answers only while final Offering Public Eligibility is Eligible — an Offering that stopped being eligible after its card was drawn is absent rather than refused, and a retired Offering, a Restricted Business and an address that never existed are indistinguishable from outside. A successful answer produces one Offering Presentation Open occurrence; a refusal produces none. Compare, Decision Chat, Affiliate Handoff and Direct Contact are entries the experience offers and other PRDs own — none is executed here.",
        operationId: "publicOffering",
        parameters: [
          {
            in: "path",
            name: "slug",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/OfferingPresentation"
                }
              }
            },
            description: "The complete public Presentation"
          },
          "404": errorResponse(
            "No publicly eligible Offering matches that address"
          )
        },
        tags: ["Offering"]
      }
    },
    "/api/v1/offerings/{slug}/reviews": {
      get: {
        description:
          "What people said about this product (I62). Public: a review is written to be read, and hiding other people's opinions behind a sign-in would ask a person to join before finding out whether they want to buy. Signing in changes exactly one thing — the reader's own review is marked `mine`, so the page can offer to edit it rather than to write a second one. The reviews belong to the product group (PRD-0001 v4.0 §5.12), not to one seller's listing, so every seller of one product answers with the same reviews and the same score.",
        operationId: "productReviews",
        parameters: [
          {
            in: "path",
            name: "slug",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductReviews" }
              }
            },
            description: "The product's reviews and the score they produce"
          },
          "404": errorResponse(
            "No publicly eligible Offering matches that address"
          )
        },
        tags: ["Offering"]
      },
      post: {
        description:
          "Writing, or replacing, one's own review of this product (I62). Authentication is required and the refusal says nothing more than that: a Guest gets 401 and may repeat the identical request after signing in. The response is the reviews as they now stand rather than the row that was written, so a person sees where their score left the product in one request — with no window in which the page shows a review the average beside it has not counted.",
        operationId: "writeProductReview",
        parameters: [
          {
            in: "path",
            name: "slug",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WriteProductReview" }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductReviews" }
              }
            },
            description: "The product's reviews, including the one just written"
          },
          "400": errorResponse("The submission is not a valid review"),
          "401": errorResponse("Authentication is required to write a review"),
          "403": errorResponse("The request origin is not acceptable"),
          "404": errorResponse(
            "No publicly eligible Offering matches that address"
          )
        },
        tags: ["Offering"]
      }
    },
    "/api/v1/offerings/{slug}/reports": {
      post: {
        description:
          'Reporting that something on this listing is wrong (I69) — the Owner\'s "Hata Bildir". Open to a Guest deliberately: the people best placed to notice a stale price are the least likely to have an account, and a signed-in reporter is recorded only so a pattern from one account is visible. 202 rather than 200, because what the platform has done is accept a claim rather than agree with it. Bounded per caller; the refusal is a plain 429 rather than a silent drop.',
        operationId: "reportListing",
        parameters: [
          {
            in: "path",
            name: "slug",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SubmitListingReport" }
            }
          },
          required: true
        },
        responses: {
          "202": {
            content: {
              "application/json": {
                schema: {
                  additionalProperties: false,
                  properties: { received: { const: true, type: "boolean" } },
                  required: ["received"],
                  type: "object"
                }
              }
            },
            description: "The report was accepted for review"
          },
          "400": errorResponse("The submission is not a valid report"),
          "403": errorResponse("The request origin is not acceptable"),
          "404": errorResponse(
            "No publicly eligible Offering matches that address"
          ),
          "429": errorResponse("Too many reports from this caller")
        },
        tags: ["Offering"]
      }
    },
    "/api/v1/offerings/{slug}/complementary": {
      get: {
        description:
          "What goes with this listing (I70) — the complementary products a Category suggests, inherited down the Category tree so a placement written for a sector applies to every heading under it. Its own route rather than a field of the Presentation, because PRD-0006 §20.3 forbids advertising from changing what a listing is and a separate route makes that structural. An empty list is the ordinary answer: advertising is absent by default (§20.4). Nothing is counted — §20.5 excludes impression, click and revenue reporting.",
        operationId: "complementaryPlacementsForListing",
        parameters: [
          {
            in: "path",
            name: "slug",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ComplementaryPlacements"
                }
              }
            },
            description: "What this listing suggests, possibly nothing"
          }
        },
        tags: ["Offering"]
      }
    },
    "/api/v1/admin/complementary-placements": {
      get: {
        description:
          "Every complementary placement an Admin manages (I70), active or not.",
        operationId: "complementaryPlacements",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AdminComplementaryPlacements"
                }
              }
            },
            description: "The placements"
          },
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required")
        },
        tags: ["Platform"]
      },
      post: {
        description:
          "Writing one placement, or correcting the one already under that Category and label. PRD-0006 §20 gives the platform where advertising may appear and whether it appears; this is both, for this region.",
        operationId: "writeComplementaryPlacement",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateComplementaryPlacement"
              }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: {
                  additionalProperties: false,
                  properties: { created: { const: true, type: "boolean" } },
                  required: ["created"],
                  type: "object"
                }
              }
            },
            description: "The placement is written"
          },
          "400": errorResponse("The placement is not valid"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "Admin context required, or the request origin is not acceptable"
          ),
          "404": errorResponse("No active Category matches that identifier")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/complementary-placements/{placementId}": {
      delete: {
        description:
          'Switching one placement off (I70). Deactivated rather than deleted: a placement is a partner arrangement, and a row that can come back is how "we paused this" is said.',
        operationId: "deactivateComplementaryPlacement",
        parameters: [
          {
            in: "path",
            name: "placementId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: {
                  additionalProperties: false,
                  properties: { deactivated: { const: true, type: "boolean" } },
                  required: ["deactivated"],
                  type: "object"
                }
              }
            },
            description: "The placement is off"
          },
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "Admin context required, or the request origin is not acceptable"
          ),
          "404": errorResponse("No active placement matches that identifier")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/advertising": {
      get: {
        description:
          "The advertising placement settings (I75): the master switch, the publisher identifier, one unit per permitted region and the Categories kept clear. Always answers — the row is seeded and cannot be deleted — so an unconfigured platform reads as “no advertising” rather than as an absence.",
        operationId: "advertisingSettings",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdvertisingSettings" }
              }
            },
            description: "The settings as they stand"
          },
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required")
        },
        tags: ["Platform"]
      },
      put: {
        description:
          "Replacing the settings (I75). PUT rather than PATCH because this replaces a state: the switch and the identifiers are read together and submitted together.",
        operationId: "updateAdvertisingSettings",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateAdvertisingSettings"
              }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdvertisingSettings" }
              }
            },
            description: "The settings after the change"
          },
          "400": errorResponse("The settings are not valid"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "Admin context required, or the request origin is not acceptable"
          )
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/advertising/exclusions": {
      post: {
        description:
          "Marking one Category ad-free (§20.4). Inherited downwards: a sector marked clean stays clean in every heading under it. Naming one already excluded succeeds without changing anything.",
        operationId: "excludeCategoryFromAdvertising",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ExcludeCategoryFromAdvertising"
              }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: {
                  additionalProperties: false,
                  properties: { excluded: { const: true, type: "boolean" } },
                  required: ["excluded"],
                  type: "object"
                }
              }
            },
            description: "The Category is ad-free"
          },
          "400": errorResponse("The exclusion is not valid"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "Admin context required, or the request origin is not acceptable"
          ),
          "404": errorResponse("No active Category matches that identifier")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/advertising/exclusions/{categoryId}": {
      delete: {
        description:
          "Letting advertising back into one Category (I75). Deleted rather than deactivated, unlike a placement: an exclusion is a line somebody drew rather than an arrangement with anybody.",
        operationId: "includeCategoryInAdvertising",
        parameters: [
          {
            in: "path",
            name: "categoryId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: {
                  additionalProperties: false,
                  properties: { included: { const: true, type: "boolean" } },
                  required: ["included"],
                  type: "object"
                }
              }
            },
            description: "The exclusion is gone"
          },
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "Admin context required, or the request origin is not acceptable"
          ),
          "404": errorResponse("No exclusion matches that Category")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/offering-feeds": {
      get: {
        description:
          "Every partner catalogue an Admin manages (I76), with how each last went. The run travels with the feed because a list of partners that does not say which one is broken answers the wrong question.",
        operationId: "offeringFeeds",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminOfferingFeeds" }
              }
            },
            description: "The feeds"
          },
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required")
        },
        tags: ["Platform"]
      },
      post: {
        description:
          "Describing one partner catalogue: where the document is, how it is written, and which of its fields hold what. Nothing is imported here — the intake runs on a schedule, because reading somebody else's document is minutes of work against their server.",
        operationId: "writeOfferingFeed",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateOfferingFeed" }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: {
                  additionalProperties: false,
                  properties: { created: { const: true, type: "boolean" } },
                  required: ["created"],
                  type: "object"
                }
              }
            },
            description: "The feed is written"
          },
          "400": errorResponse("The feed is not valid"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "Admin context required, or the request origin is not acceptable"
          ),
          "404": errorResponse(
            "No Business matches that identifier, or no active Category does"
          )
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/offering-feeds/runs": {
      get: {
        description:
          "The sync log, newest first — news rather than a queue, because what is broken now is what an operator can act on. `outcome=FAILED` is what the dashboard reads.",
        operationId: "offeringFeedRuns",
        parameters: [
          {
            in: "query",
            name: "outcome",
            required: false,
            schema: { enum: ["FAILED"], type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OfferingFeedRuns" }
              }
            },
            description: "The runs"
          },
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/offering-feeds/{feedId}": {
      delete: {
        description:
          "Pausing one feed (I76). The listings it created stay exactly as they are: pausing says stop reading this partner's document, not withdraw their listings — that would be a moderation decision.",
        operationId: "deactivateOfferingFeed",
        parameters: [
          {
            in: "path",
            name: "feedId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: {
                  additionalProperties: false,
                  properties: { deactivated: { const: true, type: "boolean" } },
                  required: ["deactivated"],
                  type: "object"
                }
              }
            },
            description: "The feed is paused"
          },
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "Admin context required, or the request origin is not acceptable"
          ),
          "404": errorResponse("No active feed matches that identifier")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/listing-reports": {
      get: {
        description:
          "The queue of reader reports (I69), oldest first — this is work rather than news, and a queue arranged by arrival would let the oldest report sit unread behind a page of new ones. `reportsForListing` counts the open reports about the same listing, which is the fact an Admin acts on.",
        operationId: "listingReports",
        parameters: [
          {
            in: "query",
            name: "status",
            required: false,
            schema: {
              enum: ["OPEN", "ACCEPTED", "DISMISSED"],
              type: "string"
            }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ListingReports" }
              }
            },
            description: "The reports in that state"
          },
          "400": errorResponse("The status is not one of the three"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Admin context required")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/admin/listing-reports/{reportId}/review": {
      post: {
        description:
          "Closing one report (I69). Two outcomes and neither touches the listing: ACCEPTED records that an Admin agrees there is something to fix, and what is then done about it happens through the Stories that own the consequences. A report already closed answers 409 rather than being closed twice.",
        operationId: "reviewListingReport",
        parameters: [
          {
            in: "path",
            name: "reportId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReviewListingReport" }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: {
                  additionalProperties: false,
                  properties: { reviewed: { const: true, type: "boolean" } },
                  required: ["reviewed"],
                  type: "object"
                }
              }
            },
            description: "The report is closed"
          },
          "400": errorResponse("The outcome is not ACCEPTED or DISMISSED"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "Admin context required, or the request origin is not acceptable"
          ),
          "404": errorResponse("No such report"),
          "409": errorResponse("That report has already been reviewed")
        },
        tags: ["Platform"]
      }
    },
    "/api/v1/me/favourites": {
      get: {
        description:
          "Everything this person has kept (I64), as Listing Cards drawn from the cheapest currently eligible seller of each kept product. Authenticated: a favourite is a fact about a person, and a Guest has nowhere for one to live. Newest kept first.",
        operationId: "favourites",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Favourites" }
              }
            },
            description: "The kept products"
          },
          "401": errorResponse("Authentication is required")
        },
        tags: ["Offering"]
      }
    },
    "/api/v1/me/favourites/marks": {
      get: {
        description:
          "Which products this person has kept, as keys (I64) — what a page of Listing Cards needs to decide which hearts are filled.",
        operationId: "favouriteMarks",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FavouriteMarks" }
              }
            },
            description: "The kept product group keys"
          },
          "401": errorResponse("Authentication is required")
        },
        tags: ["Offering"]
      }
    },
    "/api/v1/offerings/{slug}/favourite": {
      delete: {
        description:
          "Stops keeping it (I64). The one route that resolves an Offering without the eligibility gate: an Offering whose sellers all withdrew is exactly the favourite a person is most likely to want off their list, and refusing because the catalogue can no longer show it would trap the row there. Nothing about the listing reaches the response. A slug that never existed answers the same way, because distinguishing the two would tell a prober which slugs exist.",
        operationId: "releaseFavourite",
        parameters: [
          {
            in: "path",
            name: "slug",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "204": { description: "It is no longer kept" },
          "401": errorResponse("Authentication is required"),
          "403": errorResponse("The request origin is not acceptable")
        },
        tags: ["Offering"]
      },
      put: {
        description:
          "Keeps this product (I64). Keyed on the product group rather than on the listing, so keeping it from the cheapest seller and returning through a dearer one shows it already kept. Repeating the request keeps it once.",
        operationId: "keepFavourite",
        parameters: [
          {
            in: "path",
            name: "slug",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "204": { description: "It is kept" },
          "401": errorResponse("Authentication is required"),
          "403": errorResponse("The request origin is not acceptable"),
          "404": errorResponse(
            "No publicly eligible Offering matches that address"
          )
        },
        tags: ["Offering"]
      }
    },
    "/api/v1/health/live": { get: healthOperation("getLiveness") },
    "/api/v1/health/ready": {
      get: healthOperation(
        "getReadiness",
        "A required dependency is unavailable"
      )
    }
  }
};
/**
 * The one operation that answers without consulting a dependency.
 *
 * **Measured, not assumed.** I44 drove all eighty-seven operations with no
 * database reachable at all: `GET /api/v1/health/live` answered `200` and
 * `GET /api/v1/health/ready` answered `503`. Liveness is the single operation
 * that can still answer when nothing behind it can, which is the whole point of
 * separating it from readiness — so it is the single operation for which `503`
 * would be a promise the API does not make.
 */
const ANSWERS_WITHOUT_DEPENDENCIES = "/api/v1/health/live";

/**
 * `503` is added here rather than written into eighty-six operation literals.
 *
 * `ErrorEnvelopeFilter` is registered as an `APP_FILTER`, so it is not a
 * property of any one operation that it can answer `503 DEPENDENCY_UNAVAILABLE`
 * — it is a property of **every** operation that reaches the database. Writing
 * it out per operation would make a platform-wide response look like
 * eighty-six independent decisions, and lose it again the ordinary way: a
 * ninetieth operation added, and one more literal not edited.
 *
 * Until I44 the document declared `503` on **one** operation out of
 * eighty-seven, so a client generated from it had no `503` branch anywhere but
 * readiness. Driving the API with no database returned `503` from thirteen
 * operations, and thirteen was only what an anonymous caller could reach.
 */
const paths = document.paths as unknown as Record<
  string,
  Record<string, { responses?: Record<string, unknown> }>
>;
for (const [path, methods] of Object.entries(paths)) {
  if (path === ANSWERS_WITHOUT_DEPENDENCIES) continue;
  for (const operation of Object.values(methods)) {
    const { responses } = operation;
    if (responses === undefined || "503" in responses) continue;
    responses["503"] = errorResponse("A required dependency is unavailable");
  }
}

const destination = resolve(process.cwd(), "../../generated/openapi.json");

await writeFile(
  destination,
  await format(JSON.stringify(document), { parser: "json" }),
  "utf8"
);
