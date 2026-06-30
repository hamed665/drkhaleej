# Profile graph anchor text guard

Internal profile graph links must use descriptive anchor text. The goal is to help users, crawlers, and language models understand entity relationships without guessing what a vague link means.

## Required anchor patterns

Public profile graph links should use clear labels such as:

- `View profile`
- `View doctor profile`
- `View center profile`
- Arabic equivalents for the same profile targets

## Forbidden vague anchors

The profile graph must not use vague relationship anchors such as:

- `Click here`
- `More`
- `Profile`
- `Read more`
- `Details`

## Covered surfaces

- public listing cards
- center detail doctor links
- doctor detail center links

This guard does not create new links. It only keeps existing profile graph links descriptive, because apparently even link text needs adult supervision.
