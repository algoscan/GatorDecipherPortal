import Image from "next/image"

type ButtonProps = {
	onClick: () => void
}

export const PeraWalletButton = ({onClick} : ButtonProps) => (
	<button className='flex items-center gap-2 rounded-md w-40 border-accent border-2 p-2 hover:shadow-custom transform scale-95 hover:scale-100 transition-all duration-300' onClick={onClick}>
		<div className='bg-[#FFEE55] p-1.5 rounded flex items-center justify-center'>
			<Image src='/logo_pera.png' alt="Pera Wallet Connect" width={30} height={30} />
		</div>
		<span>Pera Wallet</span>
	</button>
)

export const MyAlgoButton = ({onClick} : ButtonProps) => (
	<button className='flex items-center gap-2 rounded-md w-40 border-accent border-2 p-2 hover:shadow-custom transform scale-95 hover:scale-100 transition-all duration-300' onClick={onClick}>
		<div className='flex'>
			<Image className='rounded' src='/logo_myalgo.png' alt="Pera Wallet Connect" width={42} height={42} />
		</div>
		<span>MyAlgo</span>
	</button>
)