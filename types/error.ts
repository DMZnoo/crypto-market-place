export const ERROR = {
  WALLET_NOT_AVAILABLE: 'Wallet is not available!',
  WALLET_WRONG_NETWORK: 'Wrong Network!',
  WALLET_CONNECTIONS_ERROR: 'Please connect to a wallet.',
}

// useTx error.name TransactionExecutionError
// useTx error.message User rejected the request.

export const WALLET_ERROR = {
  // denied transactions
  // out of gas
}
// Custom errors defined on Ion Contracts
export const CONTRACT_CUSTOM_ERROR = {}

export enum METAMASK_ERROR {
  ///////////////////
  // Generic Errors

  // Unknown Error
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',

  // Not Implemented
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',

  // Unsupported Operation
  //   - operation
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION',

  // Network Error (i.e. Ethereum Network, such as an invalid chain ID)
  //   - event ("noNetwork" is not re-thrown in provider.ready; otherwise thrown)
  NETWORK_ERROR = 'NETWORK_ERROR',

  // Some sort of bad response from the server
  SERVER_ERROR = 'SERVER_ERROR',

  // Timeout
  TIMEOUT = 'TIMEOUT',

  ///////////////////
  // Operational  Errors

  // Buffer Overrun
  BUFFER_OVERRUN = 'BUFFER_OVERRUN',

  // Numeric Fault
  //   - operation: the operation being executed
  //   - fault: the reason this faulted
  NUMERIC_FAULT = 'NUMERIC_FAULT',

  ///////////////////
  // Argument Errors

  // Missing new operator to an object
  //  - name: The name of the class
  MISSING_NEW = 'MISSING_NEW',

  // Invalid argument (e.g. value is incompatible with type) to a function:
  //   - argument: The argument name that was invalid
  //   - value: The value of the argument
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',

  // Missing argument to a function:
  //   - count: The number of arguments received
  //   - expectedCount: The number of arguments expected
  MISSING_ARGUMENT = 'MISSING_ARGUMENT',

  // Too many arguments
  //   - count: The number of arguments received
  //   - expectedCount: The number of arguments expected
  UNEXPECTED_ARGUMENT = 'UNEXPECTED_ARGUMENT',

  ///////////////////
  // Blockchain Errors

  // Call exception
  //  - transaction: the transaction
  //  - address?: the contract address
  //  - args?: The arguments passed into the function
  //  - method?: The Solidity method signature
  //  - errorSignature?: The EIP848 error signature
  //  - errorArgs?: The EIP848 error parameters
  //  - reason: The reason (only for EIP848 "Error(string)")
  CALL_EXCEPTION = 'CALL_EXCEPTION',

  // Insufficient funds (< value + gasLimit * gasPrice)
  //   - transaction: the transaction attempted
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',

  // Nonce has already been used
  //   - transaction: the transaction attempted
  NONCE_EXPIRED = 'NONCE_EXPIRED',

  // The replacement fee for the transaction is too low
  //   - transaction: the transaction attempted
  REPLACEMENT_UNDERPRICED = 'REPLACEMENT_UNDERPRICED',

  // The gas limit could not be estimated
  //   - transaction: the transaction passed to estimateGas
  UNPREDICTABLE_GAS_LIMIT = 'UNPREDICTABLE_GAS_LIMIT',

  // The transaction was replaced by one with a higher gas price
  //   - reason: "cancelled", "replaced" or "repriced"
  //   - cancelled: true if reason == "cancelled" or reason == "replaced")
  //   - hash: original transaction hash
  //   - replacement: the full TransactionsResponse for the replacement
  //   - receipt: the receipt of the replacement
  TRANSACTION_REPLACED = 'TRANSACTION_REPLACED',

  ///////////////////
  // Interaction Errors

  // The user rejected the action, such as signing a message or sending
  // a transaction
  ACTION_REJECTED = 'ACTION_REJECTED',
}

export const MetamaskErrors: Record<keyof typeof METAMASK_ERROR, any> = {
  ///////////////////
  // Generic Errors

  // Unknown Error
  UNKNOWN_ERROR: {
    message: 'Unknown error had occured.',
  },

  // Not Implemented
  NOT_IMPLEMENTED: {
    message: 'Not Implemented',
  },

  // Unsupported Operation
  //   - operation
  UNSUPPORTED_OPERATION: {
    message: 'Unsupported Operation',
  },

  // Network Error (i.e. Ethereum Network, such as an invalid chain ID)
  //   - event ("noNetwork" is not re-thrown in provider.ready; otherwise thrown)
  NETWORK_ERROR: {
    message: 'Network Error',
  },

  // Some sort of bad response from the server
  SERVER_ERROR: {
    message: 'There had been a server error.',
  },

  // Timeout
  TIMEOUT: {
    message: 'The transaction had timed Out',
  },

  ///////////////////
  // Operational  Errors

  // Buffer Overrun
  BUFFER_OVERRUN: {
    type: 'OPERATIONAL_ERRORS',
    message: 'Buffer Overrun',
  },

  // Numeric Fault
  //   - operation: the operation being executed
  //   - fault: the reason this faulted
  NUMERIC_FAULT: {
    type: 'OPERATIONAL_ERRORS',
    message: 'Numeric Fault',
  },

  ///////////////////
  // Argument Errors

  // Missing new operator to an object
  //  - name: The name of the class
  MISSING_NEW: {
    type: 'ARGUMENT_ERROR',
    message: 'Missing new operator to an object',
  },

  // Invalid argument (e.g. value is incompatible with type) to a function:
  //   - argument: The argument name that was invalid
  //   - value: The value of the argument
  INVALID_ARGUMENT: {
    type: 'ARGUMENT_ERROR',
    message:
      'Invalid argument (e.g. value is incompatible with type) to a function',
  },

  // Missing argument to a function:
  //   - count: The number of arguments received
  //   - expectedCount: The number of arguments expected
  MISSING_ARGUMENT: {
    type: 'ARGUMENT_ERROR',
    message: 'Missing argument to a function',
  },

  // Too many arguments
  //   - count: The number of arguments received
  //   - expectedCount: The number of arguments expected
  UNEXPECTED_ARGUMENT: {
    type: 'ARGUMENT_ERROR',
    message: 'Too many arguments',
  },

  ///////////////////
  // Blockchain Errors

  // Call exception
  //  - transaction: the transaction
  //  - address?: the contract address
  //  - args?: The arguments passed into the function
  //  - method?: The Solidity method signature
  //  - errorSignature?: The EIP848 error signature
  //  - errorArgs?: The EIP848 error parameters
  //  - reason: The reason (only for EIP848 "Error(string)")
  CALL_EXCEPTION: {
    type: 'BLOCKCHAIN_ERROR',
    message: 'Blockchain Error',
  },

  // Insufficient funds (< value + gasLimit * gasPrice)
  //   - transaction: the transaction attempted
  INSUFFICIENT_FUNDS: {
    type: 'BLOCKCHAIN_ERROR',
    message: 'You have insufficient funds.',
  },

  // Nonce has already been used
  //   - transaction: the transaction attempted
  NONCE_EXPIRED: {
    type: 'BLOCKCHAIN_ERROR',
    message: 'Nonce has already been used',
  },

  // The replacement fee for the transaction is too low
  //   - transaction: the transaction attempted
  REPLACEMENT_UNDERPRICED: {
    type: 'BLOCKCHAIN_ERROR',
    message: 'The replacement fee for the transaction is too low',
  },

  // The gas limit could not be estimated
  //   - transaction: the transaction passed to estimateGas
  UNPREDICTABLE_GAS_LIMIT: {
    type: 'BLOCKCHAIN_ERROR',
    message: 'The gas limit could not be estimated',
  },

  // The transaction was replaced by one with a higher gas price
  //   - reason: "cancelled", "replaced" or "repriced"
  //   - cancelled: true if reason == "cancelled" or reason == "replaced")
  //   - hash: original transaction hash
  //   - replacement: the full TransactionsResponse for the replacement
  //   - receipt: the receipt of the replacement
  TRANSACTION_REPLACED: {
    type: 'BLOCKCHAIN_ERROR',
    message: 'The transaction was replaced by one with a higher gas price',
  },

  ///////////////////
  // Interaction Errors

  // The user rejected the action, such as signing a message or sending
  // a transaction
  ACTION_REJECTED: {
    type: 'INTERACTION_ERROR',
    message: 'You have rejected the transaction',
  },
}

export const METAMASK_POSSIBLE_ERRORS = {
  '-32700': {
    standard: 'JSON RPC 2.0',
    message:
      'Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.',
  },
  '-32600': {
    standard: 'JSON RPC 2.0',
    message: 'The JSON sent is not a valid Request object.',
  },
  '-32601': {
    standard: 'JSON RPC 2.0',
    message: 'The method does not exist / is not available.',
  },
  '-32602': {
    standard: 'JSON RPC 2.0',
    message: 'Invalid method parameter(s).',
  },
  '-32603': {
    standard: 'JSON RPC 2.0',
    message: 'Internal JSON-RPC error.',
  },
  '-32000': {
    standard: 'EIP-1474',
    message: 'Invalid input.',
  },
  '-32001': {
    standard: 'EIP-1474',
    message: 'Resource not found.',
  },
  '-32002': {
    standard: 'EIP-1474',
    message: 'Resource unavailable.',
  },
  '-32003': {
    standard: 'EIP-1474',
    message: 'Transaction rejected.',
  },
  '-32004': {
    standard: 'EIP-1474',
    message: 'Method not supported.',
  },
  '-32005': {
    standard: 'EIP-1474',
    message: 'Request limit exceeded.',
  },
  '4001': {
    standard: 'EIP-1193',
    message: 'User rejected the request.',
  },
  '4100': {
    standard: 'EIP-1193',
    message:
      'The requested account and/or method has not been authorized by the user.',
  },
  '4200': {
    standard: 'EIP-1193',
    message: 'The requested method is not supported by this Ethereum provider.',
  },
  '4900': {
    standard: 'EIP-1193',
    message: 'The provider is disconnected from all chains.',
  },
  '4901': {
    standard: 'EIP-1193',
    message: 'The provider is disconnected from the specified chain.',
  },
}

export const ContractErrors: Record<string, any> = {
  DepositSurpassesSupplyCap: {
    message:
      'The maximum capacity of lender liquidity has already been reached.',
  },
  InsufficientBalance: {
    message:
      'The amount requested for withdrawal is greater than the amount entitled to your account.',
  },
  CeilingExceeded: {
    message: 'The debt ceiling for this market has already been reached.',
  },
  UnsafePositionChange: {
    message: 'The requested change in position is not available',
  },
}
