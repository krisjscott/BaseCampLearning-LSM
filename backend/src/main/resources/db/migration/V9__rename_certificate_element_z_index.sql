-- z_index was JSON-unsafe: Jackson's default bean-naming mangles a getter like
-- getZIndex() to the wire property "zindex" (it collapses runs of 2+ leading
-- uppercase letters), so client-sent "zIndex" values never bound and every
-- element was silently persisted with a null order. Renaming to order_index
-- (matching the orderIndex convention already used by course_modules/lessons)
-- sidesteps the ambiguity entirely instead of fighting it with annotations.
ALTER TABLE certificate_template_elements RENAME COLUMN z_index TO order_index;
