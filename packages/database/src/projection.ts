/**
 * The Discovery read model, written from an Offering.
 *
 * **Here rather than beside one of its callers, because it now has three.**
 * `US-OFR-F04-001` writes it on publication, `US-BUS-F03-001` rewrites it when
 * a Business is restored, and I76's feed intake writes it for every Offering a
 * partner's document changes — and the intake runs in the worker, which cannot
 * reach into the API. A second copy of this query would be a second copy that
 * drifts, and the two would disagree about what a person can find.
 *
 * `$1` is the Offering, `$2` the eligibility version.
 */
export const PROJECT_OFFERING = `with path as (
         -- The active Category path, root first. A person recognises an
         -- Offering by where it sits, not only by its leaf.
         with recursive walk as (
           select c.id, c.parent_id, c.name, 0 as depth
           from category c
           join offering o on o.category_id = c.id
           where o.id = $1
           union all
           select parent.id, parent.parent_id, parent.name, walk.depth + 1
           from category parent join walk on walk.parent_id = parent.id
         )
         select string_agg(name, ' ' order by depth desc) as names from walk
       ),
       attributes as (
         -- Display values, not identifiers: the option label a person would
         -- read, and the scalar as it would be shown.
         --
         -- I66: **the field's name goes in beside its value.** A person types
         -- what they would say out loud — "16 gb ram laptop" — and three of
         -- those four words are the *names* of things: the value alone matched
         -- "16" and "gb" and had nothing for "ram", so the query that the whole
         -- Attribute catalogue exists to answer returned nothing. The unit
         -- joins it for the same reason: "14 inç" is how the screen size is
         -- read and written.
         --
         -- **attribute_definition.searchable is deliberately not consulted**,
         -- and this was tried the other way first. US-DSC-F02-001 AC-3 makes
         -- every applicable Attribute value matchable without qualification, so
         -- honouring the flag here narrows a Frozen criterion — the existing
         -- test for AC-3 failed the moment the gate was added, which is the
         -- guard working. The flag has never decided anything and still does
         -- not; what it is *for* is a question for the PRD rather than a
         -- behaviour to introduce from a repository.
         select string_agg(
           d.name || ' ' ||
           coalesce(opt.label, v.text_value, v.number_value::text,
             case when v.boolean_value then 'true' else 'false' end) ||
           coalesce(' ' || d.unit, ''),
           ' '
         ) as values
         from offering_attribute_value v
         join attribute_definition d on d.id = v.attribute_definition_id
         left join attribute_option opt on opt.id = v.option_id
         where v.offering_id = $1
       )
       insert into offering_search_projection
         (offering_id, business_id, domain_id, category_id, title, summary,
          business_name, category_path, attribute_text, searchable_text,
          filter_values, published_at, eligibility_version, projected_at)
       select o.id, o.business_id, c.domain_id, o.category_id, o.title,
         o.summary, b.name,
         coalesce(path.names, c.name),
         coalesce(attributes.values, ''),
         concat_ws(' ', o.title, o.summary, b.name, coalesce(path.names, c.name),
           coalesce(attributes.values, '')),
         coalesce(
           (select jsonb_object_agg(v."attributeId", v.value)
            from (
              select av.attribute_definition_id::text as "attributeId",
                case
                  when count(av.option_id) > 0
                    then to_jsonb(array_remove(
                      array_agg(av.option_id::text order by av.option_id), null))
                  else coalesce(
                    to_jsonb(max(av.text_value)),
                    to_jsonb(max(av.number_value)),
                    to_jsonb(bool_or(av.boolean_value))
                  )
                end as value
              from offering_attribute_value av
              where av.offering_id = o.id
              group by av.attribute_definition_id
            ) v),
           '{}'::jsonb
         ),
         o.published_at, $2, now()
       from offering o
       join business b on b.id = o.business_id
       join category c on c.id = o.category_id
       cross join path
       cross join attributes
       where o.id = $1
       on conflict (offering_id) do update set
         business_id = excluded.business_id,
         domain_id = excluded.domain_id,
         category_id = excluded.category_id,
         title = excluded.title,
         summary = excluded.summary,
         business_name = excluded.business_name,
         category_path = excluded.category_path,
         attribute_text = excluded.attribute_text,
         searchable_text = excluded.searchable_text,
         filter_values = excluded.filter_values,
         published_at = excluded.published_at,
         eligibility_version = excluded.eligibility_version,
         projected_at = excluded.projected_at`;
