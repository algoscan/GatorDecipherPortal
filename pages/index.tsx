import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'
import Head from 'next/head'
import Confetti from 'react-confetti'
// @ts-ignore
import HTMLComment from 'react-html-comment'

import { PeraWalletConnect } from '@perawallet/connect'
import type MyAlgoConnect from '@randlabs/myalgo-connect'


import { PeraWalletButton, MyAlgoButton } from '../components/Buttons';
import { makeAuthTxn } from '../components/utils';

const peraWallet = new PeraWalletConnect();

const customToast = (message: string) => (
	toast.custom((t) => (
		<div className={`${t.visible ? 'animate-enter' : 'animate-leave'} pointer-events-auto card card-compact shadow-xl bg-error`}>
			<div className='card-body flex flex-row items-center'>
				<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-error-content flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
				{message === 'Already Redeemed' ? <p>The promo code(s) for your AlgoGator(s) have already been revealed. Please reach out to <a href='mailto:decipherevent@algorand.com' target="_blank" rel="noreferrer" className="link">decipherevent@algorand.com</a> if you believe this is in error.</p> : <p>{message}</p>}
			</div>
		</div>
	  ), { duration: message === 'Already Redeemed' ? 20000 : 7000})
)

export default function Home(){
	const [status, setStatus] = useState({provider: '', stage: 1})
	const [acc, setAcc] = useState('')
	const [confetti, setConfetti] = useState(false)

	const [myAlgoConnect, setMyAlgoWallet] = useState<null | MyAlgoConnect>(null)

	const connectWallet = async (provider: string) => {
		if(provider === 'pera'){
			peraWallet.connect().then((newAcc) => {
				peraWallet.connector?.on("disconnect", disconnectWallet)
		
				setAcc(newAcc[0])
				setStatus({provider: 'pera', stage: 2})
			}).catch(e => console.log(e))
		} else if(provider === 'myalgo'){
			try { 
				if(myAlgoConnect !== null){
					const accounts = await myAlgoConnect.connect()
					setAcc(accounts[0].address)
					setStatus({provider: 'myalgo', stage: 2})
				} else {
					throw 'MyAlgo Failed to Load'
				}
			} catch (e : any){
				customToast(e.toString())
			}
		} else if(provider === 'algosigner'){
			// NOT IMPLEMENTED
		}
	}

	const disconnectWallet = async () => {
		if(status.provider === 'pera'){
			await peraWallet.disconnect()?.catch(e => console.log(e))
		}

		setAcc('')
		setStatus({provider: '', stage: 1})
	}

	useEffect(() => {
		peraWallet.reconnectSession().then((newAcc) => {
			peraWallet.connector?.on("disconnect", () => disconnectWallet)
			if(newAcc.length){
				setAcc(newAcc[0])
				setStatus({provider: 'pera', stage: 2})
			}
		}).catch(e => console.log(e))

		import('@randlabs/myalgo-connect').then((MyAlgoConnect) => {
			const myAlgoWallet = new MyAlgoConnect.default()
			setMyAlgoWallet(myAlgoWallet)
		}).catch((err) => customToast(err.toString()))

	}, [])

	const { data, refetch, isFetching, isError, error } = useQuery(['getNFTs'], async () => {
		const authTxn = await makeAuthTxn(acc);
		let signedTxn;
		if(status.provider === 'pera'){ 
			signedTxn = (await peraWallet.signTransaction([[{txn: authTxn, signers: [acc]}]]))[0]
		} else if(status.provider === 'myalgo'){
			signedTxn = (await myAlgoConnect?.signTransaction(authTxn.toByte()))?.blob
		} else {
			customToast('Invalid Provider')
		}

		if(typeof signedTxn === 'undefined') throw 'Failed to Sign Txn';
		
		const response = await fetch('/api/verify', {
			method: 'POST',
			body: Buffer.from(signedTxn).toString('base64'),
			headers: { 'Content-Type': 'text/plain'},
		})

		if(response.ok){
			return response.json()
		} else {
			let err = (await response.json()).message
			customToast(err)
			await disconnectWallet()
			throw err
		}

	}, {
		refetchOnWindowFocus: false,
		enabled: false,
		retry: false
	})

	useEffect(() => {
		if(data){
			setStatus({...status, stage: 3})
			setConfetti(true)
		}
	}, [data])

	return (
		<>
		<Head>
			<title>Decipher Gator Portal</title>
			<meta name="name" content="Decipher Gator Portal" />
			<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
			<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
			<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
		</Head>
		<HTMLComment text="Designed and Build by Harsh Baid (https://twitter.com/harshbaid_)" />
		<Toaster position='top-right' reverseOrder={false} />
		{confetti && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={500} recycle={false} onConfettiComplete={() => setConfetti(false)} />}
		<main className=''>
			<label htmlFor="info-modal" className="btn btn-secondary btn-circle modal-button absolute top-0 left-0 m-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></label>
			<input type="checkbox" id="info-modal" className="modal-toggle" />
			<label htmlFor="info-modal" className="modal cursor-pointer">
				<label className="modal-box relative" htmlFor="">
					<h3 className="text-lg font-bold mb-2">Congratulations Algo Gator Hodler!</h3>
					<p className='mb-4'>Algo Gator holders are eligible to claim special discounted pricing on a pass for Decipher &apos;22 (1 gator = 1 promo code). To get your promo code and redeem your discount, follow these instructions:</p>
					<ol type='1' className="list-decimal text-sm mx-4">
						<li className='my-4 pl-2'>Connect the Algorand wallet that holds your Algo Gator (either Pera Wallet or MyAlgo) and follow the prompts to validate your NFT.</li>
						<li className='my-4 pl-2'>Once your unique promo code is revealed on screen, be sure to copy it down! Each promo code is unique and <b>will only be shown once</b>.</li>
						<li className='my-4 pl-2'>Enter your unique discount code into the “Promo Code” field during the checkout process on <a className='link link-secondary' href='https://algorand.foundation/decipher' target="_blank"  rel="noreferrer">algorand.foundation/decipher</a></li>
					</ol>
				</label>
			</label>
			<section className='card card-compact w-88 md:w-[512px] bg-black shadow-lg shadow-black text-white'>
				<ul className="steps w-80 mx-auto py-2 font-medium my-4">
					<li data-content="1" className={"step " + (status.stage >= 1 && 'step-accent')}>CONNECT</li>
					<li data-content="2" className={"step " + (status.stage >= 2 && 'step-accent')}>VALIDATE</li>
					<li data-content="3" className={"step " + (status.stage >= 3 && 'step-accent')}>REVEAL</li>
				</ul>
				{status.stage === 1 && <div className='card-body'>
					<h1 className='text-center text-lg font-semibold'>Connect Your Wallet</h1>
					<div className='flex justify-center gap-5 my-2'>
						<PeraWalletButton onClick={() => connectWallet('pera')} />
						<MyAlgoButton onClick={() => connectWallet('myalgo')} />
					</div>
				</div>}
				{status.stage === 2 && <div className='card-body'>
					<h1 className='text-center text-lg font-semibold'>Validate Gator NFTs</h1>
					<div className='grid grid-cols-2 gap-2'>
						<button className={"btn btn-error hover:shadow-custom-red " + (isFetching && 'btn-disabled')} onClick={() => disconnectWallet()}>DISCONNECT</button>
						<button className={'btn btn-secondary border-accent border-2 hover:border-accent hover:shadow-custom transition-all duration-300 ' + (isFetching && 'btn-disabled')} onClick={() => refetch()}>{isFetching ? <span className="loader"></span> : 'Validate NFT'}</button>
					</div>
				</div>}
				{status.stage === 3 && <div className='card-body'>
					<h1 className='text-center text-lg font-semibold'>We found {data.length} Gator(s)!</h1>
					<div className="overflow-auto w-full max-h-96">
						<table className="table table-compact w-full">
							<tbody>
								{data.map((gator : {id: number, asset: number, promo: string}) =>
									<tr key={gator.id}><td>
										<div className="flex items-center space-x-3">
											<div className="avatar">
												<div className="mask mask-circle w-20 h-20">
													<Image src={'/gators/' + gator.id + '.png'} width={80} height={80} />
												</div>
											</div>
											<div>
												<div className="font-bold text-black">CODE: <span className='text-primary'>{gator.promo}</span></div>
												<div className="text-sm opacity-50 text-black">ID: {gator.asset}</div>
											</div>
										</div>
									</td>
									<td key={gator.promo}><button className='tooltip text-black' data-tip="Copy" onClick={() => (typeof window !== 'undefined' && navigator && navigator.clipboard && navigator.clipboard.writeText && navigator.clipboard.writeText(gator.promo))}><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-80 hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button></td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
					<div className='alert shadow-lg text-sm text-black mt-4'>
						<div>
							<p>Copy and paste your <span className='text-primary'>promo code(s)</span> into the <span className='text-primary'>&quot;promo code&quot;</span> field when registering to receive your discount. <br />  <br /><b>Please note:</b> this code is <b>only redeemable once</b>, and it will only appear on this page <b>one time</b> -- so be sure to copy it down now! </p>
						</div>
					</div>
				</div>}
			</section>
		</main>
		<footer className='absolute bottom-0 mb-4 flex gap-8 font-extrabold'>
			<a href='https://www.algorand.foundation/' target="_blank" rel="noreferrer">/ Foundation</a>
			<a href='https://twitter.com/DecipherEvent' target="_blank" rel="noreferrer">/ Twitter</a>
			<a href='https://algorand.foundation/decipher' target="_blank" rel="noreferrer">/ Tickets</a>
		</footer>
		</>
	)
}
