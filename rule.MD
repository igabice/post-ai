rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Team members can read/write their team data
    match /teams/{teamId} {
      function isMember() {
        return request.auth != null && request.auth.uid in resource.data.members;
      }
      
      function isCreatingUserMember() {
        return request.auth != null && request.auth.uid in request.resource.data.members;
      }
      
      function isCreatingUserAdmin() {
        return isCreatingUserMember() && 
               request.resource.data.members[request.auth.uid].permissions.isAdmin == true;
      }
      
      // Allow read if user is a member of the team
      allow read: if isMember();
      
      // Allow update and delete if user is a member
      allow update, delete: if isMember();
      
      // Allow create if the user creating the team is the first member and is an admin
      allow create: if request.auth != null &&
        request.resource.data.members.keys().hasOnly([request.auth.uid]) &&
        isCreatingUserAdmin();
    }

    // Rules for posts
    match /posts/{postId} {
      function isTeamMember(teamId) {
        let team = get(/databases/$(database)/documents/teams/$(teamId));
        return team != null && request.auth.uid in team.data.members;
      }

      // Allow read if user is member of the post's team
      allow read: if request.auth != null && isTeamMember(resource.data.teamId);
      
      // Allow create if user is member of the target team
      allow create: if request.auth != null && isTeamMember(request.resource.data.teamId);
      
      // Allow update if user is member of the existing post's team
      allow update: if request.auth != null && isTeamMember(resource.data.teamId);
      
      // Allow delete if user is member of the post's team
      allow delete: if request.auth != null && isTeamMember(resource.data.teamId);
    }

    // Rules for invitations
    match /invitations/{inviteId} {
      function canSendInvites(teamId) {
        let team = get(/databases/$(database)/documents/teams/$(teamId));
        return team != null && 
               request.auth.uid in team.data.members &&
               team.data.members[request.auth.uid].permissions.sendInvites == true;
      }

      function isInvitedUser() {
        return resource.data.invitedEmail == request.auth.token.email;
      }

      // Allow create if user has sendInvites permission for the team
      allow create: if request.auth != null && canSendInvites(request.resource.data.teamId);

      // Allow read only by the invited user or team members who can send invites
      allow read: if request.auth != null && (
        isInvitedUser() || canSendInvites(resource.data.teamId)
      );

      // Allow update only by the invited user (for accepting invitations)
      allow update: if request.auth != null && isInvitedUser();
    }
    
    // Fallback: deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}