// Business-event counters. Safe to import and call unconditionally: `@opentelemetry/api`
// returns a documented no-op meter until `instrumentation.js` registers a real
// MeterProvider, so these calls are inert when observability is off.
import { metrics } from '@opentelemetry/api'

const meter = metrics.getMeter('shoply-business')

export const ordersPlacedCounter = meter.createCounter('shoply.orders.placed', {
  description: 'Orders successfully placed',
  unit: '{order}',
})

export const orderRevenueCounter = meter.createCounter('shoply.orders.revenue', {
  description: 'Revenue from placed orders',
  unit: 'USD',
})

export const checkoutFailedCounter = meter.createCounter('shoply.checkout.failed', {
  description: 'Checkout attempts that did not result in an order (the closest thing this app has to a payment failure, since checkout is mocked and takes no real payment)',
  unit: '{attempt}',
})
