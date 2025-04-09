import { NextResponse } from 'next/server'
import { Alchemy, Network } from 'alchemy-sdk'

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
}

const alchemy = new Alchemy(config)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    const nfts = await alchemy.nft.getNftsForOwner(address)
    return NextResponse.json({ nfts: nfts.ownedNfts })
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch NFTs' },
      { status: 500 }
    )
  }
} 