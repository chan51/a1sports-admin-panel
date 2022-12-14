export const URL_LIST = {
  Auth: {
    LoginUser: 'api/v1/login-user',
    LogoutUser: 'api/v1/logout-user',
    UpdatePassword: 'api/v1/update-password',
  },

  Users: {
    GetUsers: 'api/v1/get-users',
    CreateUser: 'api/v1/create-user',
    UpdateUser: 'api/v1/update-user',
    DeleteUsers: 'api/v1/delete-users',
    ApproveUsers: 'api/v1/approve-user',
    GetUserFiles: 'api/v1/get-user-files',
    ToggleExpertUsers: 'api/v1/toggle-expert-user',
  },

  Players: {
    GetPlayers: 'api/v1/get-players',
    CreatePlayer: 'api/v1/create-player',
    UpdatePlayer: 'api/v1/update-player',
    DeletePlayers: 'api/v1/delete-players',
    UpdatePlayersStatus: 'api/v1/update-players-status',
    UpdatePlayersTicker: 'api/v1/update-players-ticker',
    GetTeamNames: 'api/v1/get-team-names',
  },

  FAQs: {
    GetFAQs: 'api/v1/get-faqs',
    CreateFAQ: 'api/v1/create-faq',
    UpdateFAQ: 'api/v1/update-faq',
    DeleteFAQs: 'api/v1/delete-faqs',
  },

  Chat: {
    GetChatLinks: 'api/v1/get-chat-links',
    GetChatMedia: 'api/v1/get-chat-media',
  },

  Feeds: {
    DeleteFeed: 'api/v1/delete-feed',
    UpdateFeedStatus: 'api/v1/update-feed-status',
  },

  Schedules: {
    GetSchedules: 'api/v1/get-schedules',
    CreateSchedule: 'api/v1/create-schedule',
    UpdateSchedule: 'api/v1/update-schedule',
    DeleteSchedules: 'api/v1/delete-schedules',
  },
};
