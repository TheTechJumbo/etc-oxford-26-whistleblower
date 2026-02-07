// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ReportEmitter {
    event ReportSubmitted(bytes32 reportHash, string reportType);

    function submitReport(bytes32 reportHash, string calldata reportType) external {
        require(reportHash != bytes32(0), "empty hash");
        emit ReportSubmitted(reportHash, reportType);
    }
}
