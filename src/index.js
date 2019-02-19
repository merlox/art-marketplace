import React from 'react'
import ReactDOM from 'react-dom'
import { MetamaskProvider } from '@0xcert/ethereum-metamask-provider'
import { schema88 } from '@0xcert/conventions'
import { Cert } from '@0xcert/cert'

// Assets Ledgers are groups of tokens that are managed by certain users just like mods in a chat to do what's required
// The Capabilities determine what those mods can do with the assets they are managing
// The Ethereum address that deploys this ledger has full powers to do whatever he wants as the administrator
import { AssetLedger, AssetLedgerCapability } from '@0xcert/ethereum-asset-ledger'

class Main extends React.Component {
    constructor() {
        super()
        this.state = {
            provider: {},
            ledger: {}
        }
    }

    // Get the imprint, deploy a new asset with the existing ledger

    async componentDidMount() {
        await this.setProvider()
        await this.setExistingLedger()
        await this.deployArtAsset()
        // await this.getBlueprint()
        // await this.deployNewAssetLedger()
    }

    // To set a metamask provider
    async setProvider() {
        const provider = new MetamaskProvider()
        if (!(await provider.isEnabled())) await provider.enable()
        await this.setState({provider})
    }

    // To set the ledger as a state object
    async setExistingLedger() {
        const ledgerAddress = '0xE543F07af5b8f57b0325A954DEfb8027a5b89c5A'
        const ledger = AssetLedger.getInstance(this.state.provider, ledgerAddress)
        await this.setState({ledger})
    }

    // To get user ERC721 token balance
    async getUserBalance() {
        const balance = await this.state.ledger.getBalance(web3.eth.accounts[0])
        console.log('balance', balance)
    }

    // To deploy a new asset
    async deployArtAsset() {
        await this.state.ledger.createAsset({
            id: 5,
            imprint: 'd3cdf78025cf18c121159c41058359f3d3fb6d3daa0dad4864f9583e6ef0e36a',
            receiverId: web3.eth.accounts[0]
        }).then(mutation => {
            console.log('Creating new asset, this may take a while...')
            return mutation.complete()
        }).then(result => {
            console.log('Deployed!')
        }).catch(e => {
            console.log('Error', e)
        })
    }

    // To generate new ERC721 assets
    async getBlueprint() {
        const cert = new Cert({
            schema: schema88
        })
        const asset = {
            description: 'A lighthouse watercolor picture',
            image: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Taran_Lighthouse_Kalinigrad_Oblast_Tatiana_Yagunova_Watercolor_painting.jpg',
            name: 'Lighthouse Watercolor'
        }
        // The imprint is the schemaId we need for deploying a ledger
        console.log('Imprint', await cert.imprint(asset))
        console.log('Disclose', await cert.disclose(asset, [['name'], ['image']]).then(result => JSON.stringify(result)))
    }

    // To create a new asset ledger containing several assets and managed by several individuals
    // The asset ledger is mandatory to create new assets since they need a place to be stored, they can't exist without a ledger
    async deployNewAssetLedger() {
        let deployedLedger = {}

        // The required keys are name, symbol, uriBase and schemaId
        const recipe = {
            name: 'Art Piece',
            symbol: 'ART',
            uriBase: 'https://raw.githubusercontent.com/merlox/art-marketplace/master/uriBase.json',
            schemaId: '0xd3cdf78025cf18c121159c41058359f3d3fb6d3daa0dad4864f9583e6ef0e36a',
            capabilities: [
                AssetLedgerCapability.DESTROY_ASSET,
                AssetLedgerCapability.UPDATE_ASSET,
                AssetLedgerCapability.TOGGLE_TRANSFERS,
                AssetLedgerCapability.REVOKE_ASSET
            ]
        }

        try {
            deployedLedger = await AssetLedger.deploy(this.state.provider, recipe).then(mutation => mutation.complete())
            console.log('Ledger', deployedLedger)
        } catch (e) {
            console.log('Error', e)
        }

        if (deployedLedger.isCompleted()) {
            console.log('Ledger address', deployedLedger.receiverId)
        }
    }

    render() {
        return (
            <div>The project has been setup.</div>
        )
    }
}

ReactDOM.render(<Main />, document.querySelector('#root'))
