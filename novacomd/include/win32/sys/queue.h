/*
 * Windows build only: MinGW has no <sys/queue.h>. This is the tail queue subset of the
 * BSD header that novacomd uses (main.c, host/recovery.c), with the same semantics.
 */

#ifndef __NOVACOMD_WIN32_SYS_QUEUE_H
#define __NOVACOMD_WIN32_SYS_QUEUE_H

#define TAILQ_HEAD(name, type)						\
struct name {								\
	struct type *tqh_first;	/* first element */			\
	struct type **tqh_last;	/* addr of last next element */		\
}

#define TAILQ_ENTRY(type)						\
struct {								\
	struct type *tqe_next;	/* next element */			\
	struct type **tqe_prev;	/* address of previous next element */	\
}

#define TAILQ_EMPTY(head)	((head)->tqh_first == NULL)
#define TAILQ_FIRST(head)	((head)->tqh_first)
#define TAILQ_NEXT(elm, field)	((elm)->field.tqe_next)

#define TAILQ_FOREACH(var, head, field)					\
	for ((var) = TAILQ_FIRST((head)); (var); (var) = TAILQ_NEXT((var), field))

#define TAILQ_INIT(head) do {						\
	(head)->tqh_first = NULL;					\
	(head)->tqh_last = &(head)->tqh_first;				\
} while (0)

#define TAILQ_INSERT_HEAD(head, elm, field) do {			\
	if (((elm)->field.tqe_next = (head)->tqh_first) != NULL)	\
		(head)->tqh_first->field.tqe_prev = &(elm)->field.tqe_next; \
	else								\
		(head)->tqh_last = &(elm)->field.tqe_next;		\
	(head)->tqh_first = (elm);					\
	(elm)->field.tqe_prev = &(head)->tqh_first;			\
} while (0)

#define TAILQ_INSERT_TAIL(head, elm, field) do {			\
	(elm)->field.tqe_next = NULL;					\
	(elm)->field.tqe_prev = (head)->tqh_last;			\
	*(head)->tqh_last = (elm);					\
	(head)->tqh_last = &(elm)->field.tqe_next;			\
} while (0)

#define TAILQ_REMOVE(head, elm, field) do {				\
	if (((elm)->field.tqe_next) != NULL)				\
		(elm)->field.tqe_next->field.tqe_prev = (elm)->field.tqe_prev; \
	else								\
		(head)->tqh_last = (elm)->field.tqe_prev;		\
	*(elm)->field.tqe_prev = (elm)->field.tqe_next;			\
} while (0)

#endif
