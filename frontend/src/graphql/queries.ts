import { gql } from '@apollo/client';

export const GET_ROOM_QUERY = gql`
  fragment FullRoomContext on Room {
    documentId
    roomId
    phase
    turnData
    entropyState
    isProcessing

    # 1. World State
    world {
      documentId
      name
      description
    }

    # 2. Characters & Players
    players {
      id
      name
      action
      isReady
      isOnline
      joinedAt
      user {
        documentId
        username
      }
      character {
        documentId
        name
        portrait {
          url
        }
        stats {
          strength
          dexterity
          constitution
          intelligence
          wisdom
          charisma
        }
        inventory {
          quantity
          isEquipped
          item {
            documentId
            name
            ... on Item {
              type
              description
              rarity
              value
              weight
              equipment_data {
                armor_class_base
                damage_dice
                range_normal
              }
              spell_data {
                level
                school
              }
            }
          }
        }
      }
    }

    # 3. Active Entities
    entity_sheets {
      documentId
      name
      type
      currentHp
      maxHp
      position {
        x
        y
        z
      }
      availableActions {
        id
        name
        description
        type
        range {
          type
          value
          reach
        }
      }
    }

    # 4. Deep History
    turns(sort: "turnNumber:desc", pagination: { limit: 10 }) {
      documentId
      turnNumber
      narrative
      actions
      messages(sort: "timestamp:asc") {
        documentId
        content
        senderName
        timestamp
      }
    }

    # 5. Event Log
    events(sort: "timestamp:desc", pagination: { limit: 20 }) {
      documentId
      type
      timestamp
      turn_number
      payload
      actor {
        documentId
        name
      }
    }
  }

  query GetRoom($filters: RoomFiltersInput) {
    rooms(filters: $filters) {
      ...FullRoomContext
    }
  }
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
  query ListMonsters($filters: EntitySheetFiltersInput) {
    entitySheets(filters: $filters, sort: "name:asc", pagination: { limit: 50 }) {
      documentId
      name
      type
      currentHp
      maxHp
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

export const GET_WORLD_TIME_QUERY = gql`
  query GetWorldTime($roomId: ID!) {
    getWorldTime(roomId: $roomId) {
      ticks
      day
      year
      timeOfDay
      formatted
      isDay
      lightLevel
    }
  }
`;

export const GAME_VIEW_QUERY = gql`
  query GameView($roomId: ID!) {
    gameView(roomId: $roomId) {
      room {
        ...FullRoomContext
      }
      activeTurn {
        documentId
        turnNumber
        summary
      }
      myself {
        documentId
        name
        type
        currentHp
        maxHp
        position {
          x
          y
          z
        }
        stats {
          strength
          dexterity
          constitution
          intelligence
          wisdom
          charisma
        }
        inventory {
          quantity
          isEquipped
          item {
            documentId
            name
            ... on Item {
              type
              description
              rarity
            }
          }
        }
      }
      visibleEntities {
        documentId
        name
        type
        currentHp
        maxHp
        position {
          x
          y
          z
        }
        availableActions {
          id
          name
          description
          type
          range {
            type
            value
            reach
          }
        }
      }
      messages {
        documentId
        content
        senderName
        senderType
        timestamp
      }
    }
  }
`;
