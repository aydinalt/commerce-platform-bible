# Domain Modules

These packages reserve the module ownership boundaries accepted in ADR-0010.
They intentionally contain no product behaviour yet. Each module will grow
through its own `domain`, `application`, `infrastructure`, and `interface`
folders only when an implementation increment requires them.

Cross-module table writes are prohibited. Communication uses public application
interfaces and committed domain events.
