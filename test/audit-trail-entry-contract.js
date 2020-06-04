/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { AuditTrailEntryContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('AuditTrailEntryContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new AuditTrailEntryContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"audit trail entry 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"audit trail entry 1002 value"}'));
    });

    describe('#auditTrailEntryExists', () => {

        it('should return true for a audit trail entry', async () => {
            await contract.auditTrailEntryExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a audit trail entry that does not exist', async () => {
            await contract.auditTrailEntryExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createAuditTrailEntry', () => {

        it('should create a audit trail entry', async () => {
            await contract.createAuditTrailEntry(ctx, '1003', 'audit trail entry 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"audit trail entry 1003 value"}'));
        });

        it('should throw an error for a audit trail entry that already exists', async () => {
            await contract.createAuditTrailEntry(ctx, '1001', 'myvalue').should.be.rejectedWith(/The audit trail entry 1001 already exists/);
        });

    });

    describe('#readAuditTrailEntry', () => {

        it('should return a audit trail entry', async () => {
            await contract.readAuditTrailEntry(ctx, '1001').should.eventually.deep.equal({ value: 'audit trail entry 1001 value' });
        });

        it('should throw an error for a audit trail entry that does not exist', async () => {
            await contract.readAuditTrailEntry(ctx, '1003').should.be.rejectedWith(/The audit trail entry 1003 does not exist/);
        });

    });

    describe('#updateAuditTrailEntry', () => {

        it('should update a audit trail entry', async () => {
            await contract.updateAuditTrailEntry(ctx, '1001', 'audit trail entry 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"audit trail entry 1001 new value"}'));
        });

        it('should throw an error for a audit trail entry that does not exist', async () => {
            await contract.updateAuditTrailEntry(ctx, '1003', 'audit trail entry 1003 new value').should.be.rejectedWith(/The audit trail entry 1003 does not exist/);
        });

    });

    describe('#deleteAuditTrailEntry', () => {

        it('should delete a audit trail entry', async () => {
            await contract.deleteAuditTrailEntry(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a audit trail entry that does not exist', async () => {
            await contract.deleteAuditTrailEntry(ctx, '1003').should.be.rejectedWith(/The audit trail entry 1003 does not exist/);
        });

    });

});