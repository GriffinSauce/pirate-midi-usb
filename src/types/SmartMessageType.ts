export enum SmartMessageType {
	SwitchOn = 'switchOn',
	SwitchOff = 'switchOff',
	SwitchToggle = 'switchToggle',
	SequentialResetStep = 'sequentialResetStep',
	SequentialIncrementStep = 'sequentialIncrementStep',
	SequentialDecrementStep = 'sequentialDecrementStep',
	SequentialGoToStep = 'sequentialGoToStep',
	SequentialQueueNextStep = 'sequentialQueueNextStep',
	SequentialQueueStep = 'sequentialQueueStep',
	ScrollingResetStep = 'scrollingResetStep',
	ScrollingIncrementStep = 'scrollingIncrementStep',
	ScrollingDecrementStep = 'scrollingDecrementStep',
	ScrollingGoToStep = 'scrollingGoToStep',
	ScrollingQueueNextStep = 'scrollingQueueNextStep',
	ScrollingQueueStep = 'scrollingQueueStep',
	BankUp = 'bankUp',
	BankDown = 'bankDown',
	GoToBank = 'goToBank',
	IncrementExpStep = 'incrementExpStep',
	DecrementExpStep = 'decrementExpStep',
	GoToExpStep = 'goToExpStep',
	TrsSwitchOut = 'trsSwitchOut',
	TrsPulseOut = 'trsPulseOut',
}
