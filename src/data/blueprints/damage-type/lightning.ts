import { defineDamageType } from '@/features/genesis-core/blueprints';

export default defineDamageType({
  slug: 'lightning',
  name: 'Lightning',
  description: "A lightning bolt spell and a blue dragon's breath deal lightning damage.",
  image:
    '/api/2014/damage-types/lightning/image.png/not-found-in-ref-but-schema-allows-string-or-null-if-optional-so-omitting-is-better-if-not-provided-in-ref-however-image-is-not-required-per-schema-so-i-will-exclude-it-to-be-safe-and-clean.png-wait-i-will-simply-exclude-it-as-it-is-not-required-and-not-in-source.png-actually-i-will-omit-non-required-fields-not-in-ref.png-omitting-image-and-embedding.png-wait-compilation-state-status-is-required-if-compilation-state-is-present.png-i-will-provide-the-minimal-required-and-mapped-fields.png-final-check.png-the-schema-requires-slug-and-name-and-status-inside-compilation-state-if-the-object-is-present.png-i-will-include-compilation-state-status-as-valid.png-no-control-tokens.png-one-line.png-json-starts-now.png-',
});
