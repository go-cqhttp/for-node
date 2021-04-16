const service = require("./service");

module.exports = (options) => {
  return async ({ data, ws, http }) => {
    if (data.notice_type === "group_recall") {
      const message = await service.getRecall(http, data.message_id);
      if (message) {
        ws.send("send_group_msg", {
          group_id: data.group_id,
          message,
        });
      }
      return;
    }

    if (data.notice_type === "friend_recall") {
      const message = await service.getRecall(http, data.message_id);
      if (message) {
        ws.send("send_private_msg", {
          user_id: data.user_id,
          message,
        });
      }
    }
  };
};
