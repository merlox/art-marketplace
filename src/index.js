import React from 'react'
import ReactDOM from 'react-dom'
import { MetamaskProvider } from '@0xcert/ethereum-metamask-provider'
import { AssetLedger } from '@0xcert/ethereum-asset-ledger'

class Main extends React.Component {
    constructor() {
        super()
        start()
    }

    async start() {
        const provider = new MetamaskProvider()
        const ledgerId = '0xeF5781A2c04113e29bE5724ae6E30bC287610007'
        const ledger = new AssetLedger(provider, ledgerId)
        const balance = await ledger.getBalance('0xeF5781A2c04113e29bE5724ae6E30bC287610007')
        console.log('balance', balance)
    }

    render() {
        return (
            <div>The project has been setup.</div>
        )
    }
}

ReactDOM.render(<Main />, document.querySelector('#root'))
