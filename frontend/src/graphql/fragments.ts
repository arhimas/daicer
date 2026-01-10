import { gql } from '@apollo/client';

export const FULL_CONTEXT_FRAGMENT = gql`
  fragment FullRoomContext on Room {
    documentId
    roomId
    phase
    turnData
    entropyState

    # 1. World State
    world {
      documentId
      name
      description
      # worldTime/weather removed (not in schema)
    }

    # 2. Characters & Players
    players {
      id # Component ID
      name
      action
      isReady
      isOnline
      joinedAt
      user {
        documentId # User is a relation, has ID
        username
      }
      character {
        documentId
        name
        portrait {
          url
        }
        # Blueprint - no HP here
        stats {
          strength
          dexterity
          constitution
          intelligence
          wisdom
          charisma
        }
        inventory {
          # Component game.inventory-item
          quantity
          isEquipped
          item {
            documentId
            name
            # Polymorphic Item support
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
        availableActions {
          id
          name
          description
          type
          cost {
            resource
            amount
          }
          range
        }
      }
    }

    # 3. Active Entities (Monsters/NPCs)
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
      # Conditions removed (not in schema)
      availableActions {
        id
        name
        description
        type
        range
      }
    }

    # 4. Deep History (Turns & Messages)
    turns(sort: "turnNumber:desc", pagination: { limit: 10 }) {
      documentId
      turnNumber
      narrative
      actions # JSON scalar, no subfields
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
`;
