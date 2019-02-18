import React from 'react'
import ReactDOM from 'react-dom'
import { MetamaskProvider } from '@0xcert/ethereum-metamask-provider'

// Assets Ledgers are groups of tokens that are managed by certain users just like mods in a chat to do what's required
// The Capabilities determine what those mods can do with the assets they are managing
// The Ethereum address that deploys this ledger has full powers to do whatever he wants as the administrator
import { AssetLedger, AssetLedgerCapabilities } from '@0xcert/ethereum-asset-ledger'

class Main extends React.Component {
    constructor() {
        super()
        this.state = {
            provider: {}
        }
        this.start()
    }

    async start() {
        const provider = new MetamaskProvider()
        const ledgerId = '0xeF5781A2c04113e29bE5724ae6E30bC287610007'
        const ledger = new AssetLedger(provider, ledgerId)
        const balance = await ledger.getBalance('0xeF5781A2c04113e29bE5724ae6E30bC287610007')
        await this.setState({provider})
        console.log('balance', balance)
    }

    async deployNewAssetLedger() {
        // The required keys are name, symbol, uriBase and schemaId
        const recipe = {
            name: 'Art Piece',
            symbol: 'ART',
            uriBase: '',
            schemaId: ''
            capabilities: [
                AssetLedgerCapabilities.DESTROY_ASSET,
                AssetLedgerCapabilities.UPDATE_ASSET,
                AssetLedgerCapabilities.REVOKE_ASSET,
                AssetLedgerCapabilities.TOGGLE_ASSET
            ]
        }

        // This requires a smart contract transaction with gas and such cuz its called a mutation
        const ledgerMutation = await AssetLedger.deploy(this.state.provider, recipe)
    }

    render() {
        return (
            <div>The project has been setup.</div>
        )
    }
}

ReactDOM.render(<Main />, document.querySelector('#root'))
