// import { markets } from '@/config';
// import { BorrowTxHistory, LendTxHistory } from '@/hooks/useTxHistory';
// import { formatBigInt } from '@/utils/number';
// import React from 'react';

// export interface TxHistoryTableProps {
//     lendTxHistory?: LendTxHistory
//     borrowTxHistory?: BorrowTxHistory
//     marketId: number
// }

// export const TxHistoryTable: React.FC<TxHistoryTableProps> = ({ lendTxHistory, marketId }) => {
//     const formatDate = (timestamp: number): string => {
//         const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
//         return date.toLocaleString(); // Converts to readable date-time format
//     };

//     return (
//         <table className="w-full table-fixed"> {/* Added table-fixed to control column width */}
//             <thead className="border-b">
//                 <tr>
//                     <th className="text-left pb-4 w-1/4">TxType</th> {/* Equal width */}
//                     <th className="text-left pb-4 w-1/4">Timestamp</th> {/* Equal width */}
//                     <th className="text-right pb-4 w-1/4">Amount</th> {/* Equal width */}
//                     <th className="text-center pb-4 w-1/4">TxHash</th> {/* Equal width */}
//                 </tr>
//             </thead>
//             <tbody>
//                 {lendTxHistory?.map((tx, index) => (
//                     <tr key={index}>
//                         <td className="text-left pt-4 w-1/4">{tx.eventName}</td> {/* Equal width */}
//                         <td className="text-left pt-4 w-1/4">{formatDate(tx.timestamp)}</td> {/* Equal width */}
//                         <td className="text-right pt-4 w-1/4">
//                             {formatBigInt(tx.amount, 18, 4) + ' ' + markets[marketId].lenderAsset}
//                         </td> {/* Equal width */}
//                         <td className="text-center pt-4 w-1/4">{tx.txHash}</td> {/* Equal width */}
//                     </tr>
//                 ))}
//             </tbody>
//         </table>

//     );
// };

// export default TxHistoryTable;
