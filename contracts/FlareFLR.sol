// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import {IFdcVerification} from "@flarenetwork/flare-periphery-contracts/coston2/IFdcVerification.sol";
import {IEVMTransaction} from "@flarenetwork/flare-periphery-contracts/coston2/IEVMTransaction.sol";

contract FlareFLR {
    bytes32 private constant REPORT_SUBMITTED_SIG =
        keccak256("ReportSubmitted(bytes32,string)");

    address public immutable sourceEmitter;

    struct Report {
        bytes32 reportHash;
        bytes32 sourceTxHash;
        uint64 bucketMs;
        uint64 anchoredAt;
        string reportType;
    }

    mapping(bytes32 => Report) private reports;
    bytes32[] private reportIndex;

    event ReportAnchored(bytes32 indexed reportHash, bytes32 indexed sourceTxHash, uint64 bucketMs);

    constructor(address sourceEmitter_) {
        require(sourceEmitter_ != address(0), "empty emitter");
        sourceEmitter = sourceEmitter_;
    }

    function anchorFromEvmProof(IEVMTransaction.Proof calldata proof) external {
        IFdcVerification verifier =
            IFdcVerification(ContractRegistry.getFdcVerification());
        require(verifier.verifyEVMTransaction(proof), "invalid proof");

        IEVMTransaction.ResponseBody calldata body = proof.data.responseBody;
        require(body.status == 1, "tx failed");

        bytes32 reportHash;
        string memory reportType;
        bool found;

        for (uint256 i = 0; i < body.events.length; i++) {
            IEVMTransaction.Event calldata evmEvent = body.events[i];
            if (evmEvent.emitterAddress != sourceEmitter) {
                continue;
            }
            if (evmEvent.topics.length == 0 || evmEvent.topics[0] != REPORT_SUBMITTED_SIG) {
                continue;
            }
            (reportHash, reportType) = abi.decode(evmEvent.data, (bytes32, string));
            found = true;
            break;
        }

        require(found, "report event not found");
        require(reportHash != bytes32(0), "empty hash");
        require(reports[reportHash].reportHash == bytes32(0), "already anchored");

        reports[reportHash] = Report({
            reportHash: reportHash,
            sourceTxHash: body.transactionHash,
            bucketMs: uint64(block.timestamp / 60) * 60,
            anchoredAt: uint64(block.timestamp),
            reportType: reportType
        });
        reportIndex.push(reportHash);

        emit ReportAnchored(reportHash, body.transactionHash, uint64(block.timestamp / 60) * 60);
    }

    function getReport(bytes32 reportHash) external view returns (Report memory) {
        return reports[reportHash];
    }

    function reportCount() external view returns (uint256) {
        return reportIndex.length;
    }

    function reportHashAt(uint256 index) external view returns (bytes32) {
        require(index < reportIndex.length, "out of range");
        return reportIndex[index];
    }
}
