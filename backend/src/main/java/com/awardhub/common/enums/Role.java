package com.awardhub.common.enums;

/**
 * The one Role enum for the whole application.
 *
 * MERGE NOTE: the vote module previously declared its own inner enum,
 * User.Role, with 9 values (VOTER, NOMINEE, JUDGE, ORGANIZER, IT_COORDINATOR,
 * AUDIT, ADMIN, HEAD_ORGANIZER, ORGANIZING_TEAM_MEMBER), on top of a
 * completely separate User entity. Now that vote's User has been merged into
 * user.entity.User, this enum absorbs the roles that were missing here
 * (IT_COORDINATOR, AUDIT, HEAD_ORGANIZER, ORGANIZING_TEAM_MEMBER) so no
 * account loses a role on migration.
 */
public enum Role {
    ADMIN,
    ORGANIZER,
    JUDGE,
    VOTER,
    NOMINEE,
    IT_COORDINATOR,
    AUDIT,
    HEAD_ORGANIZER,
    ORGANIZING_TEAM_MEMBER
}