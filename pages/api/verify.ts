import type { NextApiRequest, NextApiResponse } from 'next'
import algosdk from 'algosdk'
import nacl from "tweetnacl"
import queryDatabase from "./database";

const gators = [1, 2, 3, 4, 5, 6, 7]


interface VerifyReq extends NextApiRequest {
	method: 'POST',
	body: string
}

type Gators = {
	id: number
	asset: number
	code: string
}

type Error = {
	message: string
}

type AssetResponse = {
	amount: number
    "asset-id": number
}

export default async function handler(req: VerifyReq, res: NextApiResponse<Gators[] | Error>) {
	try {
		if(req.method !== 'POST') throw 'Invalid Request'

		const decoded = algosdk.decodeSignedTransaction(Buffer.from(req.body, 'base64'))

		if(typeof decoded.sig === 'undefined') throw 'No Signature Found'

		const pk_bytes = decoded.txn.from.publicKey
		const sig_bytes = new Uint8Array(decoded.sig)
		const txn_bytes = algosdk.encodeObj(decoded.txn.get_obj_for_encoding())
		const msg_bytes = new Uint8Array(txn_bytes.length + 2)

		msg_bytes.set(Buffer.from("TX"))
		msg_bytes.set(txn_bytes, 2)

		const validSig = nacl.sign.detached.verify(msg_bytes, sig_bytes, pk_bytes)

		if(!validSig) throw 'Invalid Signature'

		const dec = new TextDecoder()
		const note = JSON.parse(dec.decode(decoded.txn.note))

		if(note.address !== algosdk.encodeAddress(pk_bytes)) throw 'Invalid Address'
		if(note.note !== 'Decipher Gator Portal Validation') throw 'Invalid Note'
		
		let currTime = Date.now()
		let prevTime = currTime - 300000 // 5 minutes ago
		if(note.nonce < prevTime || note.nonce > currTime ) throw 'Invalid Time'

		let response = await fetch(`https://mainnet-idx.algonode.cloud/v2/accounts/${note.address}/assets?include-all=false`)
		if(!response.ok) throw 'Failed to Query Indexer'

		let assets = (await response.json()).assets
			.filter((asa: AssetResponse) => asa.amount === 1 && gators.includes(asa['asset-id']))
			.reduce((acc: number[], cv: AssetResponse) => {
				acc.push(cv['asset-id'])
				return acc;
			}, [])
		if(assets.length === 0) throw 'No Gators Found'

		let query = await queryDatabase(`<UPDATE QUERY>`, [])

		if(query.rows.length === 0) throw 'Already Redeemed'

		return res.status(200).json(query.rows)

	} catch(e: any){
		return res.status(400).json({ message: e.toString() })
	}
}
