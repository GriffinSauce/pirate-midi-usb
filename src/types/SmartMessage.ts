import { MidiMessageType } from './MidiMessageType';
import { SmartMessageType } from './SmartMessageType';

export enum SwitchSide {
  Primary = 'Primary',
  Secondary = 'Secondary',
}

export enum FlexiPart {
  None = 'None',
  Tip = 'Tip',
  Ring = 'Ring',
  TipRing = 'TipRing',
}

export interface SmartSwitchMessage {
  type: MidiMessageType.SmartMessage;
  smartType:
    | SmartMessageType.SwitchOn
    | SmartMessageType.SwitchOff
    | SmartMessageType.SwitchToggle;
  switchIndex: number;
  side: SwitchSide;
}

export interface SmartSequentialMessage {
  type: MidiMessageType.SmartMessage;
  smartType:
    | SmartMessageType.SequentialResetStep
    | SmartMessageType.SequentialIncrementStep
    | SmartMessageType.SequentialDecrementStep
    | SmartMessageType.SequentialQueueNextStep
    | SmartMessageType.ScrollingResetStep
    | SmartMessageType.ScrollingIncrementStep
    | SmartMessageType.ScrollingDecrementStep
    | SmartMessageType.ScrollingQueueNextStep;
  switchIndex: number;
}

export interface SmartSequentialWithArgMessage {
  type: MidiMessageType.SmartMessage;
  smartType:
    | SmartMessageType.SequentialGoToStep
    | SmartMessageType.SequentialQueueStep
    | SmartMessageType.ScrollingGoToStep
    | SmartMessageType.ScrollingQueueStep;
  switchIndex: number;
  stepIndex: number;
}

export interface SmartBankSwitchMessage {
  type: MidiMessageType.SmartMessage;
  smartType: SmartMessageType.BankUp | SmartMessageType.BankDown;
}

export interface SmartGoToBankMessage {
  type: MidiMessageType.SmartMessage;
  smartType: SmartMessageType.GoToBank;
  bankIndex: number;
}

export interface SmartMutateExpStepMessage {
  type: MidiMessageType.SmartMessage;
  smartType:
    | SmartMessageType.IncrementExpStep
    | SmartMessageType.DecrementExpStep;
  expIndex: number;
}

export interface SmartGoToExpStepMessage {
  type: MidiMessageType.SmartMessage;
  smartType: SmartMessageType.GoToExpStep;
  expIndex: number;
  stepIndex: number;
}

export interface SmartTrsMessage {
  type: MidiMessageType.SmartMessage;
  smartType: SmartMessageType.TrsSwitchOut | SmartMessageType.TrsPulseOut;
  flexiPort: number;
  part: FlexiPart;
}

export type ParsedSmartMessage =
  | SmartSwitchMessage
  | SmartSequentialMessage
  | SmartSequentialWithArgMessage
  | SmartBankSwitchMessage
  | SmartGoToBankMessage
  | SmartMutateExpStepMessage
  | SmartGoToExpStepMessage
  | SmartTrsMessage;
