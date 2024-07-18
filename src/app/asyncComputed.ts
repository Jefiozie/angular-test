import {
  computed,
  CreateComputedOptions,
  DestroyRef,
  effect,
  inject,
  Injector,
  signal,
  untracked,
} from "@angular/core";
import { isObservable, Observable, Subject, switchMap } from "rxjs";
import { isPromise } from "rxjs/internal/util/isPromise";

export function aSyncComputed<T>(
  computation: () => Promise<T> | Observable<T> | T | undefined,
  options?:
    | (CreateComputedOptions<void> & { initialValue?: T; injector?: Injector })
    | undefined
) {
  const destroyRef = inject(DestroyRef);
  const sourceValue = signal<T | undefined>(options?.initialValue);

  const source$ = new Subject<Promise<T> | Observable<T>>();

  const effectRef = effect(
    () => {
      const newSource = computation();
      if (!isObservable(newSource) && !isPromise(newSource)) {
        console.warn(`aSyncComputed:
          computation must return an observable or a promise, got a primitive value
          You might want to use computed instead.
      `);
        untracked(() => sourceValue.set(newSource));
        return;
      }
      untracked(() => source$.next(newSource));
    },
    { injector: options?.injector }
  );

  const sourceResult = source$.pipe(switchMap((s$) => s$)).subscribe({
    next: (value) => {
      sourceValue.set(value);
    },
    error: (error) => {
      sourceValue.set(undefined);
      throw error;
    },
  });

  destroyRef.onDestroy(() => {
    effectRef.destroy();
    sourceResult.unsubscribe();
  });

  return computed(() => sourceValue());
}
