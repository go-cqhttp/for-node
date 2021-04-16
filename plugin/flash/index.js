const service = require("./service");

module.exports = (options) => {
  return async ({ data, ws, http }) => {
    if (!data.message) {
      return;
    }

    if (data.message.indexOf("[CQ:image,type=flash,file") === -1) {
      return;
    }

    const message = await service.getFlash(http, data.message);
    if (!message) {
      return;
    }

    if (data.message_type === "group") {
      ws.send("send_group_msg", {
        group_id: data.group_id,
        message,
      });
    }

    if (data.message_type === "private") {
      ws.send("send_private_msg", {
        user_id: data.group_id,
        message,
      });
    }
  };
};
