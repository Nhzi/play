// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {Play} from "../src/Play.sol";

/// @notice forge script ./script/Deploy.s.sol:DeployPlay \
///           --rpc-url https://rpc.testnet.arc.network \
///           --private-key "$DEPLOYER_PRIVATE_KEY" \
///           --broadcast
contract DeployPlay is Script {
    function run() external returns (Play play) {
        uint256 pk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(pk);
        play = new Play();
        vm.stopBroadcast();
        console2.log("Play deployed at:", address(play));
    }
}
