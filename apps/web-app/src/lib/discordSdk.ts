import { DiscordSDK } from "@discord/embedded-app-sdk";

const CLIENT_ID = "";
type AsyncFunction = (...arguments_: never[]) => Promise<unknown>;
type AsyncReturnType<Target extends AsyncFunction> = Awaited<
  ReturnType<Target>
>;
type Auth = AsyncReturnType<typeof discordSdk.commands.authenticate>;
let auth: Auth;

const discordSdk = new DiscordSDK(CLIENT_ID);

export async function setup() {
  // Wait for the client to get ready
  await discordSdk.ready();

  // Pop open the OAuth permission modal and request for access to scopes listed in scope array below
  const { code } = await discordSdk.commands.authorize({
    client_id: "",
    response_type: "code",
    state: "",
    prompt: "none",
    scope: ["identify", "guilds"],
  });

  // Retrieve an access_token from the server
  const response = await fetch("/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
    }),
  });
  const { access_token } = await response.json();

  // Authenticate with Discord client (using the access_token)
  auth = await discordSdk.commands.authenticate({
    access_token,
  });
}
