import { gql } from '@apollo/client';
import { FULL_CONTEXT_FRAGMENT } from './fragments';

export const GET_ROOM_QUERY = gql`
  query GetRoom($filters: RoomFiltersInput) {
    rooms(filters: $filters) {
      ...FullRoomContext
    }
  }
  ${FULL_CONTEXT_FRAGMENT}
`;

export const LIST_ROOMS_QUERY = gql`
  query ListRooms($sort: [String] = ["createdAt:desc"]) {
    rooms(sort: $sort, pagination: { limit: 50 }) {
      documentId
      roomId
      code
      createdAt
      phase
      dmSettings {
        theme
        setting
        difficulty
      }
      entity_sheets {
        documentId
      }
      players {
        id
        user {
          documentId
        }
        character {
          documentId
          name
          backstory
          portrait {
            url
          }
          race {
            name
          }
          classes {
            class {
              name
            }
            level
          }
        }
      }
    }
  }
`;

export const LIST_CHARACTERS_QUERY = gql`
  query ListCharacters {
    characters(sort: "name:asc", pagination: { limit: 1000 }) {
      documentId
      name
      backstory
      race {
        name
      }
      classes {
        class {
          name
        }
        level
      }
      portrait {
        url
      }
    }
  }
`;

export const LIST_MONSTERS_QUERY = gql`
  query ListMonsters($filters: MonsterFiltersInput) {
    monsters(filters: $filters, sort: "name:asc", pagination: { limit: 50 }) {
      documentId
      name
      type
      size
      hp
      ac
      xp
      challenge_rating
    }
  }
`;

export const LIST_SPELLS_QUERY = gql`
  query ListSpells($filters: SpellFiltersInput) {
    spells(filters: $filters, sort: "name:asc", pagination: { limit: 50 }) {
      documentId
      name
      level
      school
    }
  }
`;

export const LIST_ITEMS_QUERY = gql`
  query ListItems($filters: ItemFiltersInput) {
    items(filters: $filters, sort: "name:asc", pagination: { limit: 50 }) {
      documentId
      name
      type
      rarity
      value
      weight
      equipment_data {
        armor_class_base
        damage_dice
        range_normal
        range_long
        str_minimum
        stealth_disadvantage
      }
      spell_data {
        level
        school
      }
    }
  }
`;

export const SEARCH_ENTITIES_QUERY = gql`
  query SearchEntities($query: String!) {
    searchEntities(query: $query) {
      id
      name
      type
    }
  }
`;
