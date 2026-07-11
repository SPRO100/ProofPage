// Import each provider to trigger self-registration via registerProvider()
import './stripe'
import './yukassa'
import './nowpayments'

export { getProvider, listProviders } from '../provider'
