import React from 'react'
import ReactDOM from 'react-dom'
import { MetamaskProvider } from '@0xcert/ethereum-metamask-provider'
import { schema88 } from '@0xcert/conventions'
import { Cert } from '@0xcert/cert'
// Assets Ledgers are groups of tokens that are managed by certain users just like mods in a chat to do what's required
// The Capabilities determine what those mods can do with the assets they are managing
// The Ethereum address that deploys this ledger has full powers to do whatever he wants as the administrator
import { AssetLedger, AssetLedgerCapability } from '@0xcert/ethereum-asset-ledger'
import './index.css'

class Main extends React.Component {
    constructor() {
        super()

        this.state = {
            provider: {},
            ledger: {},
            assets: []
        }
    }

    // Run your desired functions here
    async componentDidMount() {
        await this.setProvider()
        const newLedger = await this.deployNewLedger()
        await this.setExistingLedger(newLedger)
        await this.setAssetArray()
        // await this.deployArtAsset()
    }

    // To set a metamask provider
    async setProvider() {
        const provider = new MetamaskProvider()
        if (!(await provider.isEnabled())) await provider.enable()
        await this.setState({provider})
    }

    // To set the ledger as a state object
    async setExistingLedger(newLedger) {
        const ledgerAddress = newLedger
        const ledger = AssetLedger.getInstance(this.state.provider, ledgerAddress)
        await this.setState({ledger})
    }

    async setAssetArray() {
        const assets = await this.getUserBalance()
        let assetArray = []
        // Generate an array for each asset to create the corresponding ArtPiece components
        for(let i = 0; i < assets; i++) {
            assetArray.push(i)
        }
        assetArray = assetArray.map(index => (
            <ArtPiece
                assetId={index}
                key={index}
            />
        ))
        console.log('Assets', assetArray)
        await this.setState({assets: assetArray})
    }

    // To configure new ERC721 assets
    async displayBlueprint() {
        const cert = new Cert({
            schema: schema88
        })
        const asset = {
            description: 'A lighthouse watercolor picture',
            image: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Taran_Lighthouse_Kalinigrad_Oblast_Tatiana_Yagunova_Watercolor_painting.jpg',
            name: 'Lighthouse Watercolor'
        }
        // The imprint is the hashed proof for our asset
        console.log('Imprint', await cert.imprint(asset))
        console.log('Expose', await cert.expose(asset, [['name'], ['image']]))
    }

    // To get user ERC721 token balance
    async getUserBalance() {
        const balance = await this.state.ledger.getBalance(web3.eth.accounts[0])
        return balance
    }

    // To create a new asset ledger containing several assets and managed by several individuals
    // The asset ledger is mandatory to create new assets since they need a place to be stored, they can't exist without a ledger
    async deployNewLedger() {
        let deployedLedger = {}

        // The required keys are name, symbol, uriBase and schemaId
        const recipe = {
            name: 'Art Piece',
            symbol: 'ART',
            uriBase: 'www.example.com/tokenMetadata/', // This is a demonstration, you have to setup a server for generating tokens to this URI
            schemaId: '0xa4cf0407b223849773430feaf0949827373c40feb3258d82dd605ed41c5e9a2c', // This is the ID from schema88 available at the top of the github https://github.com/0xcert/framework/blob/master/conventions/88-crypto-collectible-schema.md
            capabilities: [
                AssetLedgerCapability.DESTROY_ASSET,
                AssetLedgerCapability.UPDATE_ASSET,
                AssetLedgerCapability.TOGGLE_TRANSFERS,
                AssetLedgerCapability.REVOKE_ASSET
            ]
        }

        try {
            deployedLedger = await AssetLedger.deploy(this.state.provider, recipe).then(mutation => {
                console.log('Deploying new asset ledger, it may take a few minutes.')
                return mutation.complete()
            })
            console.log('Ledger', deployedLedger)
        } catch (e) {
            console.log('Error', e)
        }

        if (deployedLedger.isCompleted()) {
            console.log('Ledger address', deployedLedger.receiverId)
            return deployedLedger.receiverId
        }
    }

    // To deploy a new asset
    async deployArtAsset() {
        const cert = new Cert({
            schema: schema88
        })
        // In your final application you'll want to dinamically generate the asset parameters to create new assets with different imprints
        const asset = {
            description: 'A lighthouse watercolor picture',
            image: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Taran_Lighthouse_Kalinigrad_Oblast_Tatiana_Yagunova_Watercolor_painting.jpg',
            name: 'Lighthouse Watercolor'
        }
        const imprint = await cert.imprint(asset)
        console.log('New imprint', imprint)
        const assetId = parseInt(await this.getUserBalance()) + 1
        console.log('id', assetId)
        await this.state.ledger.createAsset({
            id: assetId,
            imprint: imprint, // You must generate a new imprint for each asset
            receiverId: web3.eth.accounts[0]
        }).then(mutation => {
            console.log('Creating new asset, this may take a while...')
            return mutation.complete()
        }).then(result => {
            console.log('Deployed!')
            this.setAssetArray() // Update the user interface to show the deployed asset
        }).catch(e => {
            console.log('Error', e)
        })
    }

    render() {
        return (
            <div>
                <h1>ERC721 Art Marketplace</h1>
                <p>In this marketplace you can deploy unique ERC721 art pieces to the blockchain with 0xcert.</p>
                <div className="assets-container">{this.state.assets}</div>
                <button className="margin-right" onClick={() => {
                    this.deployArtAsset()
                }}>Deploy Art Piece</button>
                <button onClick={() => {
                    this.setAssetArray()
                }}>Get Art Pieces</button>
            </div>
        )
    }
}

class ArtPiece extends React.Component {
    constructor() {
        super()
    }

    render() {
        return (
            <div className="art-container">
                <img className="art-image" src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Taran_Lighthouse_Kalinigrad_Oblast_Tatiana_Yagunova_Watercolor_painting.jpg" width="300px" />
                <div className="art-id">{this.props.assetId}</div>
                <div className="art-owner">{web3.eth.accounts[0]}</div>
            </div>
        )
    }
}

ReactDOM.render(<Main />, document.querySelector('#root'))
