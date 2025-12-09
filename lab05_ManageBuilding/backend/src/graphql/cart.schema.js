const { gql } = require('apollo-server-express');

const cartTypeDefs = gql`
  type CartItem {
    id: ID!
    apartmentId: Int!
    apartment: Apartment!
    code: String!
    title: String!
    type: String!
    area: Float!
    price: Float!
    mode: CartMode!
    months: Int
    status: String!
    selected: Boolean!
    note: String
    
    block: String
    building: String
    floor: String
    
    bedrooms: Int
    bathrooms: Int
    balconies: Int
    parkingSlots: Int
    
    amenities: [String!]
    
    maintenanceFee: Float!
    deposit: Float!
    
    addedAt: String!
  }

  enum CartMode {
    RENT
    BUY
  }

  type CartSummary {
    rentTotal: Float!
    buyTotal: Float!
    depositTotal: Float!
    maintenanceTotal: Float!
    grandTotal: Float!
    selectedCount: Int!
    totalItems: Int!
  }

  type CartResponse {
    items: [CartItem!]!
    summary: CartSummary!
  }

  type Apartment {
    id: ID!
    apartmentNumber: String!
    type: String!
    area: Float!
    bedrooms: Int!
    bathrooms: Int!
    balconies: Int
    parkingSlots: Int
    monthlyRent: Float
    salePrice: Float
    isListedForRent: Boolean!
    isListedForSale: Boolean!
    maintenanceFee: Float!
    status: String!
    description: String
    amenities: [String!]
  }

  input AddToCartInput {
    apartmentId: Int!
    mode: CartMode!
    months: Int
    note: String
  }

  input UpdateCartItemInput {
    months: Int
    selected: Boolean
    note: String
  }

  type Query {
    myCart: CartResponse!
    cartSummary: CartSummary!
  }

  input CheckoutInput {
    paymentMethod: String!
    note: String
  }

  type Payment {
    id: ID!
    transactionId: String!
    amount: Float!
    status: String!
    paymentMethod: String!
    paymentDate: String!
  }

  type CheckoutResult {
    success: Boolean!
    message: String!
    payments: [Payment!]!
    completedApartments: [Apartment!]!
    userRole: String!
  }

  type Mutation {
    toggleCartItemSelection(id: ID!, selected: Boolean!): CartItem!
    selectAllCartItems(selected: Boolean!): [CartItem!]!
    checkoutCart(input: CheckoutInput!): CheckoutResult!
  }
`;

module.exports = cartTypeDefs;
