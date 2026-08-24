/**
 * How a Listing Card finds its primary visual.
 *
 * `US-DSC-F06-001` AC-4 asks for "the supplied primary visual where one is
 * available". **Five queries in three repositories compose a Listing Card**, and
 * a card that showed a different visual depending on which one built it would
 * be five answers to one question. So the rule lives here and is selected the
 * same way everywhere.
 *
 * **Not a column on `offering_search_projection`, deliberately.** That
 * projection denormalises `business_name` and `title` for search, and every
 * denormalised field carries a refresh obligation — `pg-business.repository`
 * already deletes projections when Business Information changes, for exactly
 * that reason. Visuals are addresses fetched from elsewhere and will be changed
 * in bulk, so a projected copy would be the field most likely to go stale and
 * the staleness would be invisible: a card showing an image the Offering no
 * longer has looks like a card.
 *
 * The cost is one index lookup per row. `offering_visual_offering_id_position_key`
 * makes `position = 0` a unique index probe rather than a scan, and the
 * uniqueness is what lets `limit` be absent without ambiguity — there is at most
 * one row that can match.
 */
export const PRIMARY_VISUAL_SQL = `(
  select v.url from offering_visual v
  where v.offering_id = p.offering_id and v.position = 0
) as "primaryVisualUrl"`;
