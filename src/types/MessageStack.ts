import { RawMessage } from './RawMessage';

export interface MessageStack<Message = RawMessage> {
  numMessages: number;
  messages: Message[];
}

export interface AuxMessages {
  tip: AuxMessageStacks;
  ring: AuxMessageStacks;
  tipRing: AuxMessageStacks;
}

export interface AuxMessageStacks {
  pressMessages: MessageStack;
  holdMessages: MessageStack;
}
