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
            provider: {}
        }
    }

    async componentDidMount() {
        await this.setProvider()
        await this.deployNewAssetLedger()
    }

    async setProvider() {
        const provider = new MetamaskProvider()
        await this.setState({provider})
    }

    // async start() {
    //     const provider = new MetamaskProvider()
    //     const ledgerId = '0xeF5781A2c04113e29bE5724ae6E30bC287610007'
    //     const ledger = new AssetLedger(provider, ledgerId)
    //     const balance = await ledger.getBalance('0xeF5781A2c04113e29bE5724ae6E30bC287610007')
    //     await this.setState({provider})
    //     console.log('balance', balance)
    // }

    // To generate new ERC721 assets
    async createNewAsset() {
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
    async deployNewAssetLedger() {
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

        console.log('this.state.provider', this.state.provider)
        console.log('recipe', recipe)

        // This requires a smart contract transaction with gas and such cuz its called a mutation
        const ledgerMutation = await AssetLedger.deploy(this.state.provider, recipe).then(mutation => mutation.complete())
        console.log('Ledger', ledgerMutation)
    }

    render() {
        return (
            <div>The project has been setup.</div>
        )
    }
}

ReactDOM.render(<Main />, document.querySelector('#root'))
