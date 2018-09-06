/*
 * Create a DebtOrder and send it to any Relayer that supports the Standard Relayer API
 */

import React, { Component } from "react";

import { RequestLoanForm } from "../RequestLoanForm/RequestLoanForm";

import "./App.css";

import Dharma from "@dharmaprotocol/dharma.js";

// Instantiating Dharma this way will detect Web3 on the window (i.e., Metamask)
const dharma = new Dharma();

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isAwaitingBlockchain: false
        };

        this.createLoanRequest = this.createLoanRequest.bind(this);
    }

    async createLoanRequest(formData) {
        this.setState({
            isAwaitingBlockchain: true
        });

        const { LoanRequest } = Dharma.Types;

        const { principal, collateral, expiration, termLength, interestRate } = formData;

        const accounts = await dharma.blockchain.getAccounts();

        if (!accounts) {
            console.error("No acccounts detected from web3 -- ensure a local blockchain is running.");

            this.setState({ isAwaitingBlockchain: false });

            return;
        }

        const debtorAddressString = accounts[0];

        const loanRequest = await LoanRequest.create(dharma, {
            principalAmount: principal,
            principalToken: "WETH",
            collateralAmount: collateral,
            collateralToken: "REP",
            interestRate: interestRate,
            termDuration: termLength,
            termUnit: "months",
            debtorAddress: debtorAddressString,
            expiresInDuration: expiration,
            expiresInUnit: "weeks"
        });

        this.setState({
            isAwaitingBlockchain: false
        });

        /*
         * Originate the loan:
         * Send the DebtOrder to any Relayer that supports the Standard Relayer API.
         */
        console.log(loanRequest.toJSON());
    }

    render() {
        const { isAwaitingBlockchain } = this.state;

        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Request a Loan on Dharma</h1>
                </header>

                <RequestLoanForm
                    createLoanRequest={this.createLoanRequest}
                    isAwaitingBlockchain={isAwaitingBlockchain}
                />
            </div>
        );
    }
}
