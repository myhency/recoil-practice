import {Suspense, useState} from 'react'
import {atom, atomFamily, selectorFamily, useRecoilState, useRecoilValue, useRecoilValueLoadable} from 'recoil'

// const elementPositionStateFamily = atomFamily({
//     key: 'ElementPosition',
//     default: [0, 0],
// })
// const elementPositionStateFamily = atomFamily({
//     key: 'ElementPosition',
//     default: selectorFamily({
//         key: 'ElementPosition/Default',
//         get:
//             (param: number) =>
//             ({get}) => {
//                 return computeDefaultUsingParam(param)
//             },
//     }),
// })

// const computeDefaultUsingParam = (param: number) => {
//     return [param, param]
// }

const elementPositionStateFamily = atomFamily({
    key: 'MyAtom',
    default: (param: number) => defaultBasedOnParam(param),
})

const defaultBasedOnParam = (param: number) => {
    return param % 2 === 0
        ? [Math.floor((Math.random() * 100) / 2) * 2, Math.floor((Math.random() * 100) / 2) * 2]
        : [Math.floor((Math.random() * 100) / 2) * 2 + 1, Math.floor((Math.random() * 100) / 2) * 2 + 1]
}

const ElementListItem = ({elementID}: {elementID: number}) => {
    const [position, setPosition] = useRecoilState(elementPositionStateFamily(elementID))

    return (
        <div style={{padding: '20px'}}>
            <div>Element: {elementID}</div>
            <div>Position: {`${position[0]} ${position[1]}`}</div>
            <button
                onClick={() => {
                    const newPosition = position.map((v) => v + 1)
                    setPosition(newPosition)
                }}
            >
                +
            </button>
        </div>
    )
}

const hoverState = atomFamily({
    key: 'hoverState',
    default: false,
})

const multipleHoverState = selectorFamily<boolean, number>({
    key: 'multipleHoverState',
    get:
        (elementId: number) =>
        ({get}) => {
            return get(hoverState(elementId))
        },
    set:
        (elementId: number) =>
        ({set}, newValue) => {
            set(hoverState(elementId), newValue)
        },
})

const userQuery = selectorFamily({
    key: 'userQuery',
    get:
        (userId: number | undefined) =>
        async ({get}) => {
            const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
            return response.json()
        },
})

const HoverBoxes = ({elementId}: {elementId: number}) => {
    const [user, setUser] = useState<number | undefined>(undefined)
    const [hover, setHover] = useRecoilState(multipleHoverState(elementId))
    // const userData = useRecoilValue(userQuery(user))
    const userData = useRecoilValueLoadable(userQuery(user))

    return (
        <div
            style={{
                display: 'flex',
                width: '100px',
                height: '100px',
                backgroundColor: hover ? 'gray' : 'black',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: '20px',
                marginRight: '20px',
            }}
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
            onClick={() => setUser(elementId + 1)}
        >
            <div style={{color: 'white'}}>Hover Me</div>
            <div>
                {userData.state === 'hasValue' ? (
                    <span style={{fontSize: '12px', color: 'white', textAlign: 'center'}}>
                        {userData.contents.name}
                    </span>
                ) : userData.state === 'loading' ? (
                    <span style={{fontSize: '12px', color: 'white', textAlign: 'center'}}>Loading...</span>
                ) : null}
            </div>
        </div>
    )
}

export const Family = () => {
    return (
        <div style={{flexDirection: 'column'}}>
            <div>
                <ElementListItem elementID={0} />
                <ElementListItem elementID={1} />
            </div>
            <div style={{height: '20px', backgroundColor: 'lightblue'}}></div>
            <div style={{padding: '20px', display: 'flex', flexDirection: 'row'}}>
                <HoverBoxes elementId={0} />
                <HoverBoxes elementId={1} />
                <HoverBoxes elementId={2} />
            </div>
        </div>
    )
}
