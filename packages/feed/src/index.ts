/**
 * Feed intake, as pure functions (I76).
 *
 * The Owner asked for partner catalogues to arrive as **an affiliate feed
 * rather than as scraping**: _"Ürün verilerinin partner sitelerinden ham
 * çekimi (scraping) yerine, Affiliate XML/JSON feed'leri üzerinden alınması."_
 * The difference is not technical. A feed is a document a partner publishes for
 * this purpose and may change; a scrape is a reading of a page they published
 * for people, and it breaks silently whenever they redesign it.
 *
 * **This package has no I/O and no database.** It turns bytes into records and
 * a record into a candidate, and it is where every risky decision about a
 * document written by somebody else is made — which is why it can be tested
 * exhaustively without a network or a partner.
 *
 * `PRD-0001-offering.md` §5.11 already governs what an intake may do: it may
 * create and update Offerings whose Source is Feed, **and may not modify any
 * other**. §135 leaves the mechanism to its own documents, which is this one.
 *
 * I86 adds `images.ts` here rather than beside the CSV importer that first
 * needed it, for the same reason the rest of this package exists: judging a
 * file a stranger published is the risky half, it is pure, and both intakes —
 * the file import today, the feed tomorrow — must answer it identically. A
 * copy in each would be two answers to one question.
 */
export {
  IMAGE_ADDRESS_LIMIT,
  judgeImageBody,
  MINIMUM_IMAGE_BYTES,
  readImageAddresses,
  sniffImageFormat,
  type ImageFormat,
  type ImageRefusal,
  type ImageRefusalCode
} from "./images.js";

export {
  isRejection,
  mapRecord,
  readAmount,
  readCurrency,
  readStockState,
  readUrl,
  type FeedCandidate,
  type FeedMapping,
  type FeedRejection,
  type FeedStockState
} from "./mapping.js";

export {
  FeedFormatError,
  findItems,
  findJsonItems,
  flattenElement,
  flattenJson,
  readFeed,
  type FeedFormat,
  type FeedRecord
} from "./records.js";

export {
  expandEntities,
  parseXml,
  XmlParseError,
  type XmlElement
} from "./xml.js";
