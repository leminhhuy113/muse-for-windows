/**
 * Typed Electron IPC Channel Registry
 * Strict contract between Main process and Trusted Local Renderer Preload.
 */

export const IPC_CHANNELS = {
  // App & Diagnostics
  APP_GET_BOOTSTRAP: 'muse:app:get-bootstrap',
  APP_GET_DIAGNOSTICS: 'muse:app:get-diagnostics',
  APP_OPEN_EXTERNAL: 'muse:app:open-external',
  APP_COPY_TEXT: 'muse:app:copy-text',
  APP_READ_CLIPBOARD: 'muse:app:read-clipboard',
  APP_CLEAR_CRASH_FLAG: 'muse:app:clear-crash-flag',

  // Settings
  SETTINGS_GET: 'muse:settings:get',
  SETTINGS_UPDATE: 'muse:settings:update',
  SETTINGS_RESET: 'muse:settings:reset',
  SETTINGS_EXPORT: 'muse:settings:export',
  SETTINGS_IMPORT: 'muse:settings:import',
  SETTINGS_SET_API_KEY: 'muse:settings:set-api-key',
  SETTINGS_CLEAR_API_KEY: 'muse:settings:clear-api-key',

  // Official Muse WebContentsView (Mode A)
  MUSE_SET_BOUNDS: 'muse:view:set-bounds',
  MUSE_NAVIGATE: 'muse:view:navigate',
  MUSE_GO_BACK: 'muse:view:go-back',
  MUSE_GO_FORWARD: 'muse:view:go-forward',
  MUSE_RELOAD: 'muse:view:reload',
  MUSE_SET_ZOOM: 'muse:view:set-zoom',
  MUSE_OPEN_EXTERNAL_AUTH: 'muse:view:open-external-auth',
  MUSE_CLEAR_SESSION: 'muse:view:clear-session',
  MUSE_GET_STATE: 'muse:view:get-state',
  MUSE_GET_QUOTA: 'muse:view:get-quota',
  MUSE_SYNC_QUOTA: 'muse:view:sync-quota',
  MUSE_GET_CHAT_SNAPSHOT: 'muse:chat:get-snapshot',
  MUSE_SEND_MESSAGE: 'muse:chat:send-message',
  MUSE_NEW_CHAT: 'muse:chat:new-chat',
  MUSE_SELECT_THREAD: 'muse:chat:select-thread',
  MUSE_OPEN_SIGNIN_WINDOW: 'muse:chat:open-signin-window',
  MUSE_PICK_CHAT_ATTACHMENTS: 'muse:chat:pick-attachments',

  // Quick Assistant
  QUICK_SUBMIT_PROMPT: 'muse:quick:submit-prompt',
  QUICK_HIDE: 'muse:quick:hide',

  // Local Workspace
  WORKSPACE_GET_USAGE: 'muse:workspace:get-usage',
  WORKSPACE_LIST_FILES: 'muse:workspace:list-files',
  WORKSPACE_SEARCH_FILES: 'muse:workspace:search-files',
  WORKSPACE_READ_PREVIEW: 'muse:workspace:read-preview',
  WORKSPACE_CREATE_FOLDER: 'muse:workspace:create-folder',
  WORKSPACE_CREATE_FILE: 'muse:workspace:create-file',
  WORKSPACE_IMPORT_FILES: 'muse:workspace:import-files',
  WORKSPACE_TRASH_ITEM: 'muse:workspace:trash-item',
  WORKSPACE_CLEAN_TEMP: 'muse:workspace:clean-temp',
  WORKSPACE_CHOOSE_ROOT: 'muse:workspace:choose-root',
  WORKSPACE_MIGRATE_ROOT: 'muse:workspace:migrate-root',
  WORKSPACE_ADD_APPROVED_FOLDER: 'muse:workspace:add-approved-folder',
  WORKSPACE_REMOVE_APPROVED_FOLDER: 'muse:workspace:remove-approved-folder',
  WORKSPACE_REVEAL_IN_EXPLORER: 'muse:workspace:reveal-in-explorer',

  // Permissions & Bridge
  PERMISSIONS_SET_POLICY: 'muse:permissions:set-policy',
  PERMISSIONS_REVOKE_ALL: 'muse:permissions:revoke-all',
  PERMISSIONS_RESET: 'muse:permissions:reset',
  PERMISSIONS_RESPOND_APPROVAL: 'muse:permissions:respond-approval',
  PERMISSIONS_GET_PENDING: 'muse:permissions:get-pending',

  BRIDGE_INVOKE_TOOL: 'muse:bridge:invoke-tool',
  BRIDGE_LIST_TOOLS: 'muse:bridge:list-tools',
  BRIDGE_SET_PAUSED: 'muse:bridge:set-paused',
  BRIDGE_EMERGENCY_STOP: 'muse:bridge:emergency-stop',
  BRIDGE_GET_MCP_TOKEN: 'muse:bridge:get-mcp-token',

  // Mode C Independent Agent
  AGENT_RUN_TASK: 'muse:agent:run-task',
  AGENT_PAUSE: 'muse:agent:pause',
  AGENT_RESUME: 'muse:agent:resume',
  AGENT_STOP: 'muse:agent:stop',
  AGENT_GET_STATE: 'muse:agent:get-state',

  // Audit Log, Downloads & Notifications
  AUDIT_QUERY: 'muse:audit:query',
  AUDIT_EXPORT: 'muse:audit:export',
  AUDIT_CLEAR: 'muse:audit:clear',
  DOWNLOADS_LIST: 'muse:downloads:list',
  DOWNLOADS_REVEAL: 'muse:downloads:reveal',
  NOTIFICATIONS_LIST: 'muse:notifications:list',
  NOTIFICATIONS_MARK_ALL_READ: 'muse:notifications:mark-all-read',
  NOTIFICATIONS_CLEAR: 'muse:notifications:clear',

  // Updates
  UPDATES_CHECK: 'muse:updates:check',
  UPDATES_GET_STATE: 'muse:updates:get-state',
  UPDATES_INSTALL: 'muse:updates:install',

  // Push events (Main -> Trusted Local Renderer)
  EVENT_MUSE_STATE: 'muse:event:muse-state',
  EVENT_QUOTA_UPDATED: 'muse:event:quota-updated',
  EVENT_MUSE_CHAT_UPDATED: 'muse:event:muse-chat-updated',
  EVENT_SETTINGS_UPDATED: 'muse:event:settings-updated',
  EVENT_APPROVAL_REQUESTED: 'muse:event:approval-requested',
  EVENT_APPROVAL_RESOLVED: 'muse:event:approval-resolved',
  EVENT_AGENT_STATE: 'muse:event:agent-state',
  EVENT_DOWNLOAD_UPDATED: 'muse:event:download-updated',
  EVENT_NOTIFICATION_ADDED: 'muse:event:notification-added',
  EVENT_UPDATE_STATE: 'muse:event:update-state',
  EVENT_NAVIGATE_SCREEN: 'muse:event:navigate-screen',
  EVENT_WINDOW_MINIMIZED: 'muse:event:window-minimized',
} as const;
