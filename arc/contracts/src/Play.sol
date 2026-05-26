// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Play — Profiles + Scores
/// @notice Onchain registry for Play user profiles and a permissionless log
///         of game scores. Profile registration is required before a score
///         can be minted; all reads are public so leaderboards and profile
///         pages can be rendered without server infrastructure.
contract Play {
    // ---- Profiles ----

    struct Profile {
        string displayName;
        string bio;
        bytes32 avatarSeed;
        uint64 registeredAt;
        bool exists;
    }

    uint8 public constant MAX_NAME_BYTES = 32;
    uint8 public constant MAX_BIO_BYTES = 140;

    mapping(address => Profile) public profiles;

    event ProfileRegistered(
        address indexed player,
        string displayName,
        bytes32 avatarSeed
    );
    event ProfileUpdated(
        address indexed player,
        string displayName,
        bytes32 avatarSeed
    );

    error ProfileAlreadyExists();
    error ProfileMissing();
    error DisplayNameEmpty();
    error DisplayNameTooLong();
    error BioTooLong();

    /// @notice Register the caller's onchain profile. Reverts if already registered.
    function register(
        string calldata displayName,
        string calldata bio,
        bytes32 avatarSeed
    ) external {
        if (profiles[msg.sender].exists) revert ProfileAlreadyExists();
        _validate(displayName, bio);
        profiles[msg.sender] = Profile({
            displayName: displayName,
            bio: bio,
            avatarSeed: avatarSeed,
            registeredAt: uint64(block.timestamp),
            exists: true
        });
        emit ProfileRegistered(msg.sender, displayName, avatarSeed);
    }

    /// @notice Update an existing profile. Reverts if not registered.
    function updateProfile(
        string calldata displayName,
        string calldata bio,
        bytes32 avatarSeed
    ) external {
        Profile storage p = profiles[msg.sender];
        if (!p.exists) revert ProfileMissing();
        _validate(displayName, bio);
        p.displayName = displayName;
        p.bio = bio;
        p.avatarSeed = avatarSeed;
        emit ProfileUpdated(msg.sender, displayName, avatarSeed);
    }

    function _validate(string calldata displayName, string calldata bio) internal pure {
        bytes memory nb = bytes(displayName);
        if (nb.length == 0) revert DisplayNameEmpty();
        if (nb.length > MAX_NAME_BYTES) revert DisplayNameTooLong();
        if (bytes(bio).length > MAX_BIO_BYTES) revert BioTooLong();
    }

    // ---- Scores ----

    struct ScoreRecord {
        address player;
        bytes32 gameId;
        uint256 score;
        uint64 timestamp;
    }

    uint256 public totalMinted;
    mapping(uint256 => ScoreRecord) public scores;
    mapping(address => mapping(bytes32 => uint256)) public bestScore;

    event ScoreMinted(
        uint256 indexed id,
        address indexed player,
        bytes32 indexed gameId,
        uint256 score,
        uint64 timestamp
    );

    /// @notice Mint a new score record for the caller. Profile required.
    function mintScore(bytes32 gameId, uint256 score)
        external
        returns (uint256 id)
    {
        if (!profiles[msg.sender].exists) revert ProfileMissing();
        unchecked {
            id = ++totalMinted;
        }
        scores[id] = ScoreRecord({
            player: msg.sender,
            gameId: gameId,
            score: score,
            timestamp: uint64(block.timestamp)
        });
        if (score > bestScore[msg.sender][gameId]) {
            bestScore[msg.sender][gameId] = score;
        }
        emit ScoreMinted(id, msg.sender, gameId, score, uint64(block.timestamp));
    }

    /// @notice Convenience: keccak256(name) — same hash the dapp uses for ids.
    function gameIdOf(string calldata name) external pure returns (bytes32) {
        return keccak256(bytes(name));
    }
}
