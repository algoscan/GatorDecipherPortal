import algosdk from 'algosdk'

const algod = new algosdk.Algodv2("", "https://mainnet-api.algonode.cloud", 443);

export const makeAuthTxn = async (address: string) => {

	const suggestedParams = await algod.getTransactionParams().do()
    const txt = new TextEncoder()

	const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
		from: address,
		to: address,
		amount: 0,
        note: txt.encode(JSON.stringify({
            address,
            note: 'Decipher Gator Portal Validation',
            nonce: new Date().getTime() 
        })),
		suggestedParams: {...suggestedParams}
	})

	txn.firstRound = 2
	txn.lastRound = 1
	txn.fee = 0

    return txn
}

export type WalletProps = {
	onComplete: () => void
	setAcc: (val: string) => void
}
