<script lang="ts">
    import { createBubbler } from 'svelte/legacy';

    const bubble = createBubbler();
    interface Props {
        disabled?: boolean;
        children?: import('svelte').Snippet;
    }

    let { disabled = false, children }: Props = $props();
</script>

<button disabled={disabled} onclick={bubble('click')}>
    {@render children?.()}
</button>

<style>
    button,
    button:after {
        cursor: pointer;
        width: 150px;
        height: 40px;
        line-height: 2em;
        font-size: 1.2em;
        font-family: "Bebas Neue", sans-serif;
        background: linear-gradient(45deg, transparent 5%, #ff013c 5%);
        border: 0;
        color: #fff;
        letter-spacing: 3px;
        box-shadow: 6px 0px 0px #00e6f6;
        outline: transparent;
        position: relative;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
    }

    button[disabled] {
        background: linear-gradient(45deg, transparent 5%, #3a292d 5%);
        box-shadow: 6px 0px 0px #4b5455;
        color: #fff;
        cursor: not-allowed;
    }

    button {
        &:after {
            --slice-0: inset(50% 50% 50% 50%);
            --slice-1: inset(80% -6px 0 0);
            --slice-2: inset(50% -6px 30% 0);
            --slice-3: inset(10% -6px 85% 0);
            --slice-4: inset(40% -6px 43% 0);
            --slice-5: inset(80% -6px 5% 0);

            content: "ALTERNATE TEXT";
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
                45deg,
                transparent 3%,
                #00e6f6 3%,
                #00e6f6 5%,
                #ff013c 5%
            );
            text-shadow:
                -3px -3px 0px #f8f005,
                3px 3px 0px #00e6f6;
            clip-path: var(--slice-0);
        }

        &:not([disabled]):hover:after {
            animation: 1s glitch;
            animation-timing-function: steps(2, end);
        }
    }

    @keyframes glitch {
        0% {
            clip-path: var(--slice-1);
            transform: translate(-20px, -10px);
        }

        10% {
            clip-path: var(--slice-3);
            transform: translate(10px, 10px);
        }

        20% {
            clip-path: var(--slice-1);
            transform: translate(-10px, 10px);
        }

        30% {
            clip-path: var(--slice-3);
            transform: translate(0px, 5px);
        }

        40% {
            clip-path: var(--slice-2);
            transform: translate(-5px, 0px);
        }

        50% {
            clip-path: var(--slice-3);
            transform: translate(5px, 0px);
        }

        60% {
            clip-path: var(--slice-4);
            transform: translate(5px, 10px);
        }

        70% {
            clip-path: var(--slice-2);
            transform: translate(-10px, 10px);
        }

        80% {
            clip-path: var(--slice-5);
            transform: translate(20px, -10px);
        }

        90% {
            clip-path: var(--slice-1);
            transform: translate(-10px, 0px);
        }

        100% {
            clip-path: var(--slice-1);
            transform: translate(0);
        }
    }
</style>
