const axios = require("axios");
const querystring = require("querystring");
const { TeamsActivityHandler, CardFactory, TeamsInfo } = require("botbuilder");

const kudos = [
  {
    "title": "Wow Our Customers",
    "value": "1"
  },
  {
    "title": "Win as a Team",
    "value": "2"
  },
  {
    "title": "Create Belonging",
    "value": "3"
  },
  {
    "title": "Stay Hungry And Humble",
    "value": "4"
  }
];
class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();
  }
  // Action.
  async handleTeamsMessagingExtensionSubmitAction(context, action) {
    switch (action.commandId) {
      case "createKudos":
        return createKudosCardCommand(context, action);
      default:
        throw new Error("NotImplemented");
    }
  }

  async getSingleMember(context) {
    try {
      const member = await TeamsInfo.getMember(
        context,
        context.activity.from.id
      );
      return member.name;
    } catch (e) {
      if (e.code === 'MemberNotFoundInConversation') {
        context.sendActivity(MessageFactory.text('Member not found.'));
        return e.code;
      }
      throw e;
    }
  }

}

async function createKudosCardCommand(context, action) {
  // The user has chosen to create a card by choosing the 'Create Card' context menu command.

  try {
    let from = context.activity?.from;
    let fromText = "";
    if (from?.name) {
      fromText = from.name + " gave Kudos";
    }
    const data = action.data;
    let selectedKudos = kudos.find((k) => k.value === data.kudos);
    const adaptiveCard = CardFactory.adaptiveCard({
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      type: "AdaptiveCard",
      version: "1.4",
      body: [
        {
          type: "TextBlock",
          text: "Kudos",
          size: "large",
          weight: "bolder",
        },
        {
          type: "TextBlock",
          text: selectedKudos.title,
          size: "medium",
          weight: "bolder",
        },
        {
          type: "TextBlock",
          text: fromText,
          size: "medium",
        },
        {
          type: "TextBlock",
          text: data.kudosMessage,
        },
      ],
    });
    const attachment = {
      contentType: adaptiveCard.contentType,
      content: adaptiveCard.content,
      preview: adaptiveCard,
    };

    let kudosObj = {};
    kudosObj.kudosMessage = data.kudosMessage;
    kudosObj.to = data.kudosTo;
    kudosObj.notifyOthers = data.notifyOthers;
    kudosObj.selectedKudos = data.kudos;
    kudosObj.hideFromFeed = data.hideFromFeed;
    kudosObj.from = data.from;
    fetch('https://dev27023.service-now.com/api/436728/kudos_teams_integration/staging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(kudosObj)
    }).then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error);

    });
    console.log(kudosObj);

    return {
      composeExtension: {
        type: "result",
        attachmentLayout: "list",
        attachments: [attachment],
      },
    };
  } catch (error) {
    console.log(error);
  }
}

module.exports.TeamsBot = TeamsBot;
