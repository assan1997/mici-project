export type Message = {
  content: string;
  senderID: string;
  sendAt: number;
  type: "sended" | "received";
  categorie:
    | "text-message"
    | "taged-message"
    | "attachement-message"
    | "emoji-message";
};
