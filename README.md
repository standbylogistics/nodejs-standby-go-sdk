# StandBy Logistics SDK

[![npm version](https://img.shields.io/npm/v/@standbylogistics/go.svg)](https://www.npmjs.com/package/@standbylogistics/go)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official Node.js SDK for integrating with the StandBy Logistics API. This SDK provides a comprehensive set of tools for managing last-mile delivery operations, including order creation, rate quotes, order tracking, and more.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [API Reference](#api-reference)
  - [Configuration](#configuration)
  - [Methods](#methods)
- [TypeScript Support](#typescript-support)
- [Error Handling](#error-handling)
- [Examples](#examples)
- [Support](#support)
- [License](#license)

## Features

- 🚀 **Easy Integration** - Simple and intuitive API
- 🔐 **Automatic Authentication** - OAuth2 client credentials flow with automatic token management
- 📦 **Full TypeScript Support** - Complete type definitions included
- ⚡ **Smart Token Caching** - Optimized token refresh and retry logic
- 🔄 **Automatic Retries** - Built-in retry mechanism for failed requests
- 🌍 **Multi-Environment** - Support for production and development environments

## Installation

Install the package using npm:

```bash
npm install @standbylogistics/go
```

## Quick Start

```typescript
import { StandBySDK } from '@standbylogistics/go';

// Initialize the SDK
const standby = new StandBySDK({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  environment: 'production', // or 'development'
});

// Get a delivery quote
const quote = await standby.quote({
  vehicleType: 'MOTORCYCLE',
  weight: 5,
  coords: [
    {
      latitude: 19.4326,
      longitude: -99.1332,
    },
    {
      latitude: 19.4978,
      longitude: -99.1269,
    },
  ],
});

console.log(`Estimated cost: $${quote.totalPrice}`);
```

## Authentication

The SDK uses OAuth2 client credentials flow for authentication. You'll need to obtain your API credentials from the StandBy Logistics dashboard.

### Obtaining Credentials

1. Log in to your StandBy Account [Production](https://go.standby.com.mx/home) or [Development](https://dev.go.standby.com.mx/home)
2. Navigate to **Profile** > **API Keys**
3. Generate a new set of credentials (Client ID and Client Secret)
4. Store these credentials securely

The SDK automatically handles token management, including:

- Initial authentication
- Token caching in memory
- Automatic token refresh
- Retry logic for authentication failures (up to 3 attempts)

## API Reference

### Configuration

#### `StandByClientConfig`

| Property       | Type                              | Required | Default        | Description                        |
| -------------- | --------------------------------- | -------- | -------------- | ---------------------------------- |
| `clientId`     | `string`                          | Yes      | -              | Your API client ID                 |
| `clientSecret` | `string`                          | Yes      | -              | Your API client secret             |
| `environment`  | `'production'` \| `'development'` | Yes      | `'production'` | API environment to use             |
| `axiosConfig`  | `AxiosConfig`                     | No       | -              | Custom Axios configuration options |

#### Example with Custom Configuration

```typescript
const standby = new StandBySDK({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  environment: 'development',
  axiosConfig: {
    timeout: 15000, // 15 seconds
    headers: {
      'Custom-Header': 'value',
    },
  },
});
```

### Methods

#### `quote(request: QuoteOrderRequest): Promise<QuoteResponse>`

Generate a rate quote for a delivery.

**Parameters:**

```typescript
interface QuoteOrderRequest {
  vehicleType: VehicleTypeEnum;
  weight: number; // in kg
  coords: Coord[];
}
```

**Returns:** `Promise<QuoteResponse>`

**Example:**

```typescript
const quote = await standby.quote({
  vehicleType: 'SEDAN',
  weight: 10,
  coords: [
    {
      latitude: 19.4326,
      longitude: -99.1332,
    },
    {
      latitude: 19.4978,
      longitude: -99.1269,
    },
  ],
});

console.log(quote);
// {
//   totalPrice: 56.84,
// }
```

---

#### `create(request: CreateOrderRequest): Promise<CreateOrderResponse>`

Create a new delivery order.

**Parameters:**

```typescript
interface CreateOrderRequest {
  dayToDeliver: string; // ISO 8601 date
  weight: number; // in kg
  vehicleType: VehicleTypeEnum;
  coords: Coord[];
  payment: PaymentTypeEnum;
  requiresSign: boolean;
  requiresEvidences: boolean;
}

interface Coord {
  latitude: number;
  longitude: number;
  address: string;
  whoReceives: string;
  whoReceivesPhone: string;
  comments: string;
  type: string; // 'PICKUP' or 'DROPOFF'
  items: Item[];
}

interface Item {
  product: string;
  quantity: number;
}
```

**Returns:** `Promise<CreateOrderResponse>`

**Example:**

```typescript
const order = await standby.create({
  dayToDeliver: '2025-11-05T14:00:00Z',
  weight: 5,
  vehicleType: 'MOTORCYCLE',
  payment: 'AUTO',
  requiresSign: true,
  requiresEvidences: true,
  coords: [
    {
      latitude: 19.4326,
      longitude: -99.1332,
      address: '123 Main St, Mexico City',
      whoReceives: 'John Doe',
      whoReceivesPhone: '1234567890',
      comments: 'Ring the doorbell',
      type: 'PICKUP',
      items: [
        {
          product: 'Package',
          quantity: 1,
        },
      ],
    },
    {
      latitude: 19.4978,
      longitude: -99.1269,
      address: '456 Oak Ave, Mexico City',
      whoReceives: 'Jane Smith',
      whoReceivesPhone: '1234567890',
      comments: 'Leave at reception',
      type: 'DROPOFF',
      items: [
        {
          product: 'Package',
          quantity: -1, // we recommend to send negative quantity for delivery
        },
      ],
    },
  ],
});

console.log(`Order created with ID: ${order.id}`);
```

---

#### `findOne(orderId: string): Promise<Order>`

Retrieve details of a specific order.

**Parameters:**

- `orderId` (string): The unique identifier of the order

**Returns:** `Promise<Order>`

**Example:**

```typescript
const order = await standby.findOne('8032945c-bbd1-4621-a926-5f8b0c439c5f');

console.log(`Order ${order.orderId}`);
```

---

#### `findAll(request: FindOrdersRequest): Promise<Order[]>`

Retrieve a list of orders within a date range.

**Parameters:**

```typescript
interface FindOrdersRequest {
  startDate: string; // ISO 8601 date
  endDate: string; // ISO 8601 date
}
```

**Returns:** `Promise<Order[]>`

**Example:**

```typescript
const orders = await standby.findAll({
  startDate: '2025-11-01T00:00:00Z',
  endDate: '2025-11-30T23:59:59Z',
});

console.log(`Found ${orders.length} orders`);
orders.forEach((order) => {
  console.log(`Order ${order.orderId}`);
});
```

---

#### `delete(orderId: string): Promise<void>`

Cancel an existing order.

**Parameters:**

- `orderId` (string): The unique identifier of the order to cancel

**Returns:** `Promise<void>`

**Example:**

```typescript
await standby.delete('8032945c-bbd1-4621-a926-5f8b0c439c5f');
console.log('Order cancelled successfully');
```

---

### Enums

#### `VehicleTypeEnum`

Available vehicle types for deliveries:

```typescript
enum VehicleTypeEnum {
  MOTORCYCLE = 'MOTORCYCLE',
  SEDAN = 'SEDAN',
  PICKUP = 'PICKUP',
  RACK_PICKUP = 'RACK_PICKUP',
  STAKE_TRUCK = 'STAKE_TRUCK',
  PLATFORM = 'PLATFORM',
  DRY_BOX = 'DRY_BOX',
}
```

#### `PaymentTypeEnum`

Payment methods:

```typescript
enum PaymentTypeEnum {
  AUTO = 'AUTO', // Automatic payment
  LINK = 'LINK', // Payment link
  CUT_OFF = 'CUT_OFF', // Cut-off payment (You need to have this option enabled in your account, otherwise it will throw an error)
}
```

## TypeScript Support

This SDK is written in TypeScript and includes comprehensive type definitions. All request and response types are exported for your convenience:

```typescript
import StandBySDK, {
  type StandByClientConfig,
  type QuoteOrderRequest,
  type CreateOrderRequest,
  type Order,
  VehicleTypeEnum,
  PaymentTypeEnum,
} from '@standbylogistics/go';
```

## Error Handling

The SDK throws standard JavaScript errors. It's recommended to wrap SDK calls in try-catch blocks:

```typescript
try {
  const order = await standby.create({
    // ... order details
  });
  console.log('Order created successfully:', order.id);
} catch (error) {
  console.error('Failed to create order:', error.message);
}
```

### Common Error Scenarios

- **Authentication Errors**: Invalid client credentials or expired tokens
- **Validation Errors**: Missing or invalid request parameters
- **Network Errors**: Connection timeouts or network unavailability
- **Rate Limiting**: Too many requests in a short time period

The SDK automatically retries failed authentication up to 3 times before throwing an error.

## Examples

### Complete Order Flow

```typescript
import StandBySDK, {
  VehicleTypeEnum,
  PaymentTypeEnum,
} from '@standbylogistics/go';

const standby = new StandBySDK({
  clientId: 'client-id',
  clientSecret: 'client-secret',
  environment: 'development',
});

async function createDelivery() {
  try {
    // Step 1: Get a quote
    const quote = await standby.quote({
      vehicleType: VehicleTypeEnum.MOTORCYCLE,
      weight: 5,
      coords: [
        { latitude: 19.4326, longitude: -99.1332 },
        { latitude: 19.4978, longitude: -99.1269 },
      ],
    });

    console.log(`Estimated cost: $${quote.totalPrice}`);

    // Step 2: Create the order
    const order = await standby.create({
      dayToDeliver: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      weight: 5,
      vehicleType: VehicleTypeEnum.MOTORCYCLE,
      payment: PaymentTypeEnum.AUTO,
      requiresSign: true,
      requiresEvidences: true,
      coords: [
        {
          latitude: 19.4326,
          longitude: -99.1332,
          address: '123 Main St, Mexico City',
          whoReceives: 'John Doe',
          whoReceivesPhone: '1234567890',
          comments: 'Front desk',
          type: 'PICKUP',
          items: [{ product: 'Documents', quantity: 1 }],
        },
        {
          latitude: 19.4978,
          longitude: -99.1269,
          address: '456 Oak Ave, Mexico City',
          whoReceives: 'Jane Smith',
          whoReceivesPhone: '1234567890',
          comments: 'Apartment 5B',
          type: 'DROPOFF',
          items: [{ product: 'Documents', quantity: -1 }],
        },
      ],
    });

    console.log(`Order created: ${order.id}`);

    // Step 3: Track the order
    const orderDetails = await standby.findOne(order.id);
    console.log(`Order status: ${orderDetails.status}`);

    return order;
  } catch (error) {
    console.error('Delivery flow failed:', error);
    throw error;
  }
}

createDelivery();
```

## Support

- **Documentation**: [https://standbylogistics.github.io](https://standbylogistics.github.io/)
- **Email**: management@standby.com.mx
- **Issues**: [GitHub Issues](https://github.com/standbylogistics/nodejs-standby-go-sdk/issues)

## License

MIT License

---

**Made with ❤️ by StandBy Logistics**
