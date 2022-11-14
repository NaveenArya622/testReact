import { useEffect, useId, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FilterForm from "./FilterForm";

const Home = () => {
    const [filterData, setFilterData] = useState();
    const [relationshipData, setRelationshipData] = useState(); 
    const [gendersData, setGendersData] = useState(); 
    const [occasionData, setOccasionData] = useState();
    const [searchParams, setSearchParams] = useSearchParams();
    const filterKey = useId()
    useEffect(() => {
        fetch("https://dev-api.toandfrom.com/v2/gender?all=true&status=activate").then(async(res) => {
            const { data} = await res.json()
                setGendersData(data)
        })
        fetch(" https://dev-api.toandfrom.com/v2/relationship?all=true&status=activate").then(async (res) => {
            const { data} = await res.json()
            setRelationshipData(data)
        })
        fetch("https://dev-api.toandfrom.com/v2/occasion?all=true&status=activate").then(async (res) => {
            const { data} = await res.json()
            setOccasionData(data)
        })
        fetch("https://dev-api.toandfrom.com/v2/filter").then(async (res) => {
            const data = await res.json()
            setFilterData(data)
        })
    }, [])

    
    const isHiddenCheck = (id, newFilterProps) => {
        const isHidden = filterData?.find((filterValue)=>(filterValue.id === id)).isHidden
        return !isHidden || filterData?.some(
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
    
    const getFilters = () => {
        const searchFilters = filterData?.reduce((prev, next) =>
            ({ ...prev, [next?.name]: searchParams.get(next?.name) })
        , {})
        return ({
            ...searchFilters,
            gender: searchParams.get("gender"),
            occasion: searchParams.get("occasion"),
            relationship: searchParams.get("relationship"),
            minimumPrice: searchParams.get("minimumPrice"),
            maximumPrice: searchParams.get("maximumPrice")
        })
    }

    const removeFilter = async(subValue, name) => {
        const filterProps = getFilters()
        if (!filterProps?.[name]?.split(" ")?.some(({ filterValue }) => filterValue?.trim() === subValue.id)) {
            const newFilterProps = await {
                ...filterProps, [name]:
                    filterProps?.[name]?.split(" ")?.filter((value) => (value?.trim() !== subValue.id)).join(" ")
            }
            const newFilters = await {
                ...newFilterProps,
                ...subValue?.triggerFilterGroup?.reduce((prev, next) => {
                    return isHiddenCheck(next.id, newFilterProps) ? { ...prev } : { ...prev, [next.name]: null }
                },{})
            }
            setSearchParams(newFilters)
        }
    }
    const remove = async (name,second) => {
        const filterProps = await getFilters()
        const newFilters = await second? {...filterProps, [name]: null} : {...filterProps, [name]: null, [second]: null}
        setSearchParams(newFilters)
    }
    const removeRange = async () => {
        const filterProps = await getFilters()
        const newFilters = await {...filterProps, minimumPrice: null, maximumPrice: null}
        setSearchParams(newFilters)
    }

    return (<div>
        <FilterForm filter={filterData} relationship={relationshipData} genders={gendersData} occasion={occasionData} />
        <ul>
            {searchParams?.get("gender")!=="null" && !!searchParams?.get("gender") && <li>
                <dl>
                    <dt>
                        Gender
                    </dt>
                    <dd>
                        {gendersData?.find(({ id }) => (id === searchParams?.get("gender")))?.name}
                        <button onClick={() => { remove("gender") }} >
                            X
                        </button>
                    </dd>
                </dl>
            </li>}
            {searchParams?.get("occasion") !== "null" && !!searchParams?.get("occasion") && <li>
                <dl>
                    <dt>
                        Occasion
                    </dt>
                    <dd>
                        {occasionData?.find(({ id }) => (id === searchParams?.get("occasion")))?.name}
                        <button onClick={() => { remove("occasion") }} >
                            X
                        </button>
                    </dd>
                </dl>
            </li>}
            {searchParams?.get("relationship") !== "null" && !!searchParams?.get("relationship") && <li>
                <dl>
                    <dt>
                        Relationship
                    </dt>
                    <dd>
                        {relationshipData?.find(({ id }) => (id = searchParams?.get("relationship")))?.name}
                        <button onClick={() => { remove("relationship") }} >
                            X
                        </button>
                    </dd>
                </dl>
            </li>}
            {((searchParams?.get("minimumPrice") !== "null" &&
                !!searchParams?.get("minimumPrice")) ||
                (searchParams?.get("maximumPrice") !== "null" &&
                    !!searchParams?.get("maximumPrice"))) && <li>
                <dl>
                    <dt>
                        Range
                    </dt>
                    <dd>
                            {(searchParams?.get("minimumPrice") !== "null" &&
                                !!searchParams?.get("minimumPrice")) &&
                                searchParams?.get("minimumPrice")}
                            {" - "}
                            {(searchParams?.get("maximumPrice") !== "null" &&
                            !!searchParams?.get("maximumPrice")) &&
                            searchParams?.get("maximumPrice")}
                        <button onClick={() => { removeRange() }} >
                            X
                        </button>
                    </dd>
                </dl>
            </li>}
            {filterData?.map(({ name, topics }, index) => (
                topics?.filter(({ id }) =>
                    (searchParams?.get(name)?.split(" ")?.some((topicId) =>
                        topicId?.trim() === id
                    ))
                )?.map((subValue, subIndex) => (
                    <li key={filterKey+index+name+subIndex}>
                        <dl>
                            <dt>
                                {name}
                            </dt>
                            <dd>
                                {subValue.name}
                                <button onClick={()=>{removeFilter(subValue,name)}} >
                                            X
                                </button>
                            </dd>
                        </dl>
                    </li>
                ))
            ))?.flat()}
        </ul>
    </div>)
}
export default Home;