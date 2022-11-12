import { useEffect, useId, useState } from "react";
import { useSearchParams } from "react-router-dom";

const FilterForm = ({ ...props }) => {
    const [filterProps, setFilters] = useState({})
    const [searchParams, setSearchParams] = useSearchParams();
    // const searchProps = searchParams.getAll();
    const genderId = useId();
    const occasionId = useId();
    const relationshipId = useId();
    const filterId = useId();
    const handleChange=(e) => {
        const name = e.target.name;
        const value = e.target.value;
        setFilters({...filterProps, [name]: value })
    }
    const addFilter = (key, value) => {
        if (filterProps?.[key] === undefined) {
            setFilters({ ...filterProps, [key]: value })
        } else
            if (!filterProps?.[key]?.split(" ")?.some((filterValue) => filterValue?.trim() === value)) {
                setFilters({ ...filterProps, [key]: filterProps?.[key]+" "+ value })
            }
    }
    const isHiddenCheck = (id, newFilterProps) => {
        return props?.filter?.some(
                ({ name, topics }) => (
                    topics?.some((topic) =>
                        (topic.triggerFilterGroup.some((tfg) =>
                            tfg.id === id
                        )) &&
                        (newFilterProps?.[name]?.split(" ")?.some((value) =>
                            value?.trim() === topic.id
                        ))
                    )
                )
            )
    }
    const removeFilter = (subValue, name) => {
        if (!filterProps?.[name]?.split(" ")?.some(({ filterValue }) => filterValue?.trim() === subValue.id)) {
            const newFilterProps = {
                ...filterProps, [name]:
                    filterProps?.[name]?.split(" ")?.filter((value) => (value?.trim() !== subValue.id)).join(" ")
            }
            setFilters({
                ...newFilterProps,
                ...subValue?.triggerFilterGroup?.reduce((prev, next) => {
                    return isHiddenCheck(next.id, newFilterProps) ? { ...prev } : { ...prev, [next.name]: null }
                },{})
            })
        }
    }
    const submitFilter = () => {
        setSearchParams(filterProps)
    }
    useEffect(() => {
        const searchFilters = props?.filter?.reduce((prev, next) =>
            ({ ...prev, [next?.name]: searchParams.get(next?.name) })
            , {})
        const gender= searchParams.get("gender")
        const occasion = searchParams.get("occasion")
        const relationship = searchParams.get("relationship")
        const minimumPrice = searchParams.get("minimumPrice")
        const maximumPrice = searchParams.get("maximumPrice")
        setFilters({
            ...searchFilters,
            gender: gender,
            occasion: occasion,
            relationship: relationship,
            minimumPrice: minimumPrice,
            maximumPrice: maximumPrice
        })
    },[searchParams,props?.filter])
    return (
        <div>
            <select name="gender" value={filterProps?.gender??""} onChange={handleChange}>
                <option>
                    Select Gender
                </option>
                {props?.genders?.map(({id,name}, index) => (<option key={genderId+index} value={id}>
                    {name}
                </option>))}
            </select>
            <select  name="occasion" value={filterProps?.occasion??""} onChange={handleChange}>
                <option>
                    Select Occasion
                </option>
                {props?.occasion?.map(({id,name}, index) => (<option key={occasionId+index} value={id}>
                    {name}
                </option>))}
            </select>
            <select name="relationship" value={filterProps?.relationship??""} onChange={handleChange}>
                <option>
                    Select Relationship
                </option>
                {props?.relationship?.map(({id,name}, index) => (<option key={relationshipId+index} value={id}>
                    {name}
                </option>))}
            </select>
            <input name="minimumPrice" value={filterProps?.minimumPrice??""} type={"number"} onChange={handleChange} placeholder="minimum Price"/>
            <input name="maximumPrice" value={filterProps?.maximumPrice??""} type={"number"} onChange={handleChange} placeholder="maximum Price" />
            <ul>
                {props?.filter?.filter(({ isHidden, id }) => !isHidden || isHiddenCheck(id, filterProps))?.map(({ id, name, topics }, index) => (<li key={filterId+index}>
                    <dl>
                        <dt>
                            {name}
                        </dt>
                        <dd>
                            <ul>
                                {topics.map((subValue,subIndex) => (
                                    <li key={filterId + index + name + subIndex}>
                                        <button onClick={()=>{addFilter(name,subValue.id)}}>
                                            {subValue.name}
                                        </button>
                                        { filterProps?.[name]?.split(" ")?.some((someValue) => (someValue?.trim() === subValue.id)) && <button onClick={()=>{removeFilter(subValue,name)}} >
                                            X
                                        </button>}
                                    </li>
                                ))}
                            </ul>
                        </dd>
                    </dl>
                </li>))}
            </ul>
            <button onClick={submitFilter}>
                SubmitFilter
            </button>
        </div>
    )
}
export default FilterForm;