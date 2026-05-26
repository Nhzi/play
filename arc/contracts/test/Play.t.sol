// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Play} from "../src/Play.sol";

contract PlayTest is Test {
    Play play;
    address alice = address(0xA11CE);
    address bob = address(0xB0B);
    bytes32 tetrisId = keccak256("tetris");
    bytes32 snakeId = keccak256("snake");
    bytes32 seed = bytes32(uint256(0x1FA90));

    function setUp() public {
        play = new Play();
    }

    // ---- Profile ----

    function test_register_succeeds() public {
        vm.warp(1_700_000_000);
        vm.prank(alice);
        play.register("alice", "hi", seed);
        (string memory n, string memory b, bytes32 s, uint64 t, bool ex) = play.profiles(alice);
        assertEq(n, "alice");
        assertEq(b, "hi");
        assertEq(s, seed);
        assertEq(t, uint64(1_700_000_000));
        assertTrue(ex);
    }

    function test_register_twice_reverts() public {
        vm.startPrank(alice);
        play.register("alice", "", seed);
        vm.expectRevert(Play.ProfileAlreadyExists.selector);
        play.register("alice2", "", seed);
        vm.stopPrank();
    }

    function test_register_emptyName_reverts() public {
        vm.expectRevert(Play.DisplayNameEmpty.selector);
        vm.prank(alice);
        play.register("", "", seed);
    }

    function test_register_nameTooLong_reverts() public {
        // 33-byte name (max is 32)
        string memory name = "abcdefghijklmnopqrstuvwxyz1234567";
        vm.expectRevert(Play.DisplayNameTooLong.selector);
        vm.prank(alice);
        play.register(name, "", seed);
    }

    function test_register_bioTooLong_reverts() public {
        // 141-byte bio (max 140)
        bytes memory bio = new bytes(141);
        for (uint256 i; i < 141; i++) bio[i] = "a";
        vm.expectRevert(Play.BioTooLong.selector);
        vm.prank(alice);
        play.register("alice", string(bio), seed);
    }

    function test_updateProfile_works() public {
        vm.startPrank(alice);
        play.register("alice", "", seed);
        bytes32 newSeed = bytes32(uint256(42));
        play.updateProfile("ALICE", "hello world", newSeed);
        vm.stopPrank();
        (string memory n, string memory b, bytes32 s,,) = play.profiles(alice);
        assertEq(n, "ALICE");
        assertEq(b, "hello world");
        assertEq(s, newSeed);
    }

    function test_updateProfile_unregistered_reverts() public {
        vm.expectRevert(Play.ProfileMissing.selector);
        vm.prank(alice);
        play.updateProfile("alice", "", seed);
    }

    function test_register_emits() public {
        vm.expectEmit(true, false, false, true);
        emit Play.ProfileRegistered(alice, "alice", seed);
        vm.prank(alice);
        play.register("alice", "", seed);
    }

    // ---- Score gating ----

    function test_mintScore_requiresProfile() public {
        vm.expectRevert(Play.ProfileMissing.selector);
        vm.prank(alice);
        play.mintScore(tetrisId, 100);
    }

    function test_mintScore_succeedsAfterRegister() public {
        vm.startPrank(alice);
        play.register("alice", "", seed);
        uint256 id = play.mintScore(tetrisId, 100);
        vm.stopPrank();
        assertEq(id, 1);
        assertEq(play.totalMinted(), 1);
    }

    function test_mintScore_assignsSequentialIds() public {
        vm.startPrank(alice);
        play.register("alice", "", seed);
        uint256 a = play.mintScore(tetrisId, 1000);
        vm.stopPrank();
        vm.startPrank(bob);
        play.register("bob", "", seed);
        uint256 b = play.mintScore(tetrisId, 500);
        vm.stopPrank();
        assertEq(a, 1);
        assertEq(b, 2);
    }

    function test_mintScore_recordsFields() public {
        vm.warp(1_700_000_000);
        vm.startPrank(alice);
        play.register("alice", "", seed);
        uint256 id = play.mintScore(tetrisId, 1234);
        vm.stopPrank();
        (address player, bytes32 gid, uint256 sc, uint64 ts) = play.scores(id);
        assertEq(player, alice);
        assertEq(gid, tetrisId);
        assertEq(sc, 1234);
        assertEq(ts, uint64(1_700_000_000));
    }

    function test_bestScore_onlyUpdatesOnImprovement() public {
        vm.startPrank(alice);
        play.register("alice", "", seed);
        play.mintScore(tetrisId, 1000);
        play.mintScore(tetrisId, 500); // no update
        play.mintScore(tetrisId, 2000); // update
        vm.stopPrank();
        assertEq(play.bestScore(alice, tetrisId), 2000);
    }

    function test_bestScore_isPerGame() public {
        vm.startPrank(alice);
        play.register("alice", "", seed);
        play.mintScore(tetrisId, 1000);
        play.mintScore(snakeId, 50);
        vm.stopPrank();
        assertEq(play.bestScore(alice, tetrisId), 1000);
        assertEq(play.bestScore(alice, snakeId), 50);
    }

    function test_emit_ScoreMinted() public {
        vm.warp(123456);
        vm.startPrank(alice);
        play.register("alice", "", seed);
        vm.expectEmit(true, true, true, true);
        emit Play.ScoreMinted(1, alice, tetrisId, 999, uint64(123456));
        play.mintScore(tetrisId, 999);
        vm.stopPrank();
    }

    function test_gameIdOf_matchesKeccak() public view {
        assertEq(play.gameIdOf("tetris"), keccak256("tetris"));
        assertEq(play.gameIdOf("snake"), keccak256("snake"));
    }
}
