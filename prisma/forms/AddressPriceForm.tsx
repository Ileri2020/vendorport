import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Country, State, City } from 'country-state-city';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from 'lucide-react';

const REGIONS = [
    "Africa",
    "Asia",
    "Europe",
    "North America",
    "South America",
    "Oceania",
    "Antarctica",
    "United Kingdom",
];

const NIGERIA_TARGET_STATES = [
    { name: 'Lagos', price: 4000 },
    { name: 'Ogun', price: 3500 },
    { name: 'Oyo', price: 3000 },
    { name: 'Kwara', price: 1000 },
    { name: 'FCT', price: 4000 }, // Abuja
];

export default function AddressPriceForm() {
    const [fees, setFees] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        scope: 'country', // 'country' | 'region'
        region: '',
        country: '',
        state: '',
        city: '',
        price: '',
    });
    
    // Custom Inputs State
    const [isCustomRegion, setIsCustomRegion] = useState(false);
    const [customRegion, setCustomRegion] = useState('');
    const [isCustomState, setIsCustomState] = useState(false);
    const [customState, setCustomState] = useState('');
    const [isCustomCity, setIsCustomCity] = useState(false);
    const [customCity, setCustomCity] = useState('');

    // Search/Filter State
    const [countrySearch, setCountrySearch] = useState('');
    const [stateSearch, setStateSearch] = useState('');
    const [citySearch, setCitySearch] = useState('');

    const [editId, setEditId] = useState<string | null>(null);
    const [seeding, setSeeding] = useState(false);

    // Derived lists
    const countries = useMemo(() => Country.getAllCountries(), []);
    const states = useMemo(() => formData.country ? State.getStatesOfCountry(formData.country) : [], [formData.country]);
    const cities = useMemo(() => formData.country && formData.state ? City.getCitiesOfState(formData.country, formData.state) : [], [formData.country, formData.state]);

    // Filtered lists
    const filteredCountries = useMemo(() => 
        countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())), 
    [countries, countrySearch]);

    const filteredStates = useMemo(() => 
        states.filter(s => s.name.toLowerCase().includes(stateSearch.toLowerCase())), 
    [states, stateSearch]);

    const filteredCities = useMemo(() => 
        cities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase())), 
    [cities, citySearch]);


    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        const res = await axios.get('/api/dbhandler?model=deliveryFee');
        setFees(res.data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let payload: any = {
            price: parseFloat(formData.price),
        };

        if (formData.scope === 'region') {
            payload.region = isCustomRegion ? customRegion : formData.region;
            payload.country = null;
            payload.state = null;
            payload.city = null;
        } else {
            payload.region = null;
            payload.country = formData.country;
            payload.state = isCustomState ? customState : (formData.state || null);
            payload.city = isCustomCity ? customCity : (formData.city || null);
        }

        if (editId) {
            await axios.put(`/api/dbhandler?model=deliveryFee&id=${editId}`, payload);
        } else {
            await axios.post('/api/dbhandler?model=deliveryFee', payload);
        }
        resetForm();
        fetchFees();
    };

    const handleEdit = (item: any) => {
        if (item.region) {
            setFormData({
                scope: 'region',
                region: item.region,
                country: '',
                state: '',
                city: '',
                price: item.price.toString(),
            });
            // check if custom
            if (!REGIONS.includes(item.region)) {
                setIsCustomRegion(true);
                setCustomRegion(item.region);
            } else {
                setIsCustomRegion(false);
            }
        } else {
            setFormData({
                scope: 'country',
                region: '',
                country: item.country,
                state: item.state || '',
                city: item.city || '',
                price: item.price.toString(),
            });
            // Handle custom state/city detection if needed (difficult without knowing if it was original ISO)
            // Assuming for now they map to codes if possible, else we might need better logic.
            // Simplified: if it's not in the list associated with the country, it's custom.
            
            // Checking logic could be added here but for now standard edit.
             setIsCustomState(false);
             setIsCustomCity(false);
        }
        setEditId(item.id);
    };

    const handleDelete = async (id: string) => {
        await axios.delete(`/api/dbhandler?model=deliveryFee&id=${id}`);
        fetchFees();
    };

    const resetForm = () => {
        setFormData({ scope: 'country', region: '', country: '', state: '', city: '', price: '' });
        setIsCustomRegion(false);
        setCustomRegion('');
        setIsCustomState(false);
        setCustomState('');
        setIsCustomCity(false);
        setCustomCity('');
        setEditId(null);
    };

    const getName = (type: 'country' | 'state' | 'city', code: string, countryCode?: string) => {
        if (!code) return 'All';
        if (type === 'country') return Country.getCountryByCode(code)?.name || code;
        if (type === 'state') return State.getStateByCodeAndCountry(code, countryCode!)?.name || code;
        return code;
    };

    const onRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'OTHER') {
            setIsCustomRegion(true);
            setFormData({ ...formData, region: '' });
        } else {
            setIsCustomRegion(false);
            setFormData({ ...formData, region: val });
        }
    }

    const onStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'OTHER') {
            setIsCustomState(true);
            setFormData({ ...formData, state: '' });
        } else {
            setIsCustomState(false);
            setFormData({ ...formData, state: val, city: '' });
        }
    }

    const onCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'OTHER') {
            setIsCustomCity(true);
            setFormData({ ...formData, city: '' });
        } else {
            setIsCustomCity(false);
            setFormData({ ...formData, city: val });
        }
    }

    const seedNigeriaLGAs = async () => {
        if (!confirm("This will add all LGAs for configured Nigerian states to the database. Continue?")) return;
        setSeeding(true);
        try {
            const ng = Country.getAllCountries().find(c => c.name === 'Nigeria' || c.isoCode === 'NG');
            if (!ng) return;

            const allStates = State.getStatesOfCountry(ng.isoCode);
            
            let count = 0;

            for (const target of NIGERIA_TARGET_STATES) {
                // Find state object to match name
                // FCT is usually "Abuja Federal Capital Territory" or similar in libraries
                const stateObj = allStates.find(s => s.name.toLowerCase().includes(target.name.toLowerCase()));
                
                if (stateObj) {
                    const cities = City.getCitiesOfState(ng.isoCode, stateObj.isoCode);
                    console.log(`Seeding ${cities.length} cities for ${target.name}...`);
                    
                    for (const city of cities) {
                        // Check if exists
                        const exists = fees.find(f => 
                            f.country === ng.isoCode && 
                            f.state === stateObj.isoCode && 
                            f.city === city.name
                        );

                        if (!exists) {
                            await axios.post('/api/dbhandler?model=deliveryFee', {
                                country: ng.isoCode,
                                state: stateObj.isoCode,
                                city: city.name,
                                region: null,
                                price: target.price
                            });
                            count++;
                        }
                    }
                }
            }
            alert(`Successfully added ${count} Local Governments.`);
            fetchFees();
        } catch (err) {
            console.error(err);
            alert("Error seeding data.");
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-lg gap-3 p-4 border rounded-md m-auto bg-card text-card-foreground shadow-sm'>
                <div className="flex justify-between items-center">
                    <h2 className='font-semibold text-xl'>Manage Delivery Fees</h2>
                    <Button type="button" variant="secondary" size="sm" onClick={seedNigeriaLGAs} disabled={seeding}>
                        {seeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Seed NG LGAs
                    </Button>
                </div>

                <Tabs value={formData.scope} onValueChange={(v) => setFormData({ ...formData, scope: v })} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="country">Country Specific</TabsTrigger>
                        <TabsTrigger value="region">Region / Group</TabsTrigger>
                    </TabsList>
                </Tabs>

                {formData.scope === 'region' ? (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Region / Group</label>
                        {!isCustomRegion ? (
                            <select
                                className="w-full rounded-md border p-2 bg-background"
                                value={formData.region}
                                onChange={onRegionChange}
                                required={!isCustomRegion}
                            >
                                <option value="">Select Region</option>
                                {REGIONS.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                                <option value="OTHER">Other / Custom Group...</option>
                            </select>
                        ) : (
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Enter Group Name (e.g. EU, UK)" 
                                    value={customRegion} 
                                    onChange={(e) => setCustomRegion(e.target.value)}
                                    required
                                />
                                <Button type="button" variant="ghost" onClick={() => setIsCustomRegion(false)}>Cancel</Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Country */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">Country</label>
                            <Input 
                                placeholder="Search Country..." 
                                value={countrySearch} 
                                onChange={(e) => setCountrySearch(e.target.value)}
                                className="mb-1 h-8 text-xs"
                            />
                            <select
                                className="w-full rounded-md border p-2 bg-background"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value, state: '', city: '' })}
                                required={formData.scope === 'country'}
                            >
                                <option value="">Select Country</option>
                                {filteredCountries.map((c) => (
                                    <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* State */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">State (Optional)</label>
                            {!isCustomState ? (
                                <>
                                    <Input 
                                        placeholder="Search State..." 
                                        value={stateSearch} 
                                        onChange={(e) => setStateSearch(e.target.value)}
                                        className="mb-1 h-8 text-xs"
                                        disabled={!formData.country}
                                    />
                                    <select
                                        className="w-full rounded-md border p-2 bg-background"
                                        value={formData.state}
                                        onChange={onStateChange}
                                        disabled={!formData.country}
                                    >
                                        <option value="">All States</option>
                                        {filteredStates.map((s) => (
                                            <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                                        ))}
                                        <option value="OTHER">Other / Custom State...</option>
                                    </select>
                                </>
                            ) : (
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Enter State Name" 
                                        value={customState} 
                                        onChange={(e) => setCustomState(e.target.value)}
                                    />
                                    <Button type="button" variant="ghost" onClick={() => setIsCustomState(false)}>List</Button>
                                </div>
                            )}
                        </div>

                        {/* City */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">City (Optional)</label>
                            {!isCustomCity ? (
                                <>
                                    <Input 
                                        placeholder="Search City..." 
                                        value={citySearch} 
                                        onChange={(e) => setCitySearch(e.target.value)}
                                        className="mb-1 h-8 text-xs"
                                        disabled={!formData.state}
                                    />
                                    <select
                                        className="w-full rounded-md border p-2 bg-background"
                                        value={formData.city}
                                        onChange={onCityChange}
                                        disabled={!formData.state}
                                    >
                                        <option value="">All Cities</option>
                                        {filteredCities.map((c: any) => (
                                            <option key={c.name} value={c.name}>{c.name}</option>
                                        ))}
                                        <option value="OTHER">Other / Custom City...</option>
                                    </select>
                                </>
                            ) : (
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Enter City Name" 
                                        value={customCity} 
                                        onChange={(e) => setCustomCity(e.target.value)}
                                    />
                                    <Button type="button" variant="ghost" onClick={() => setIsCustomCity(false)}>List</Button>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Price */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium">Price (₦)</label>
                    <Input
                        type="number"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                    />
                </div>

                <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1">{editId ? 'Update Fee' : 'Add Fee'}</Button>
                    {editId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
                </div>
            </form>

            {/* List */}
            <div className="mt-8 max-w-3xl m-auto">
                <h3 className="font-semibold text-lg mb-4">Current Delivery Fees</h3>
                <div className="grid gap-3">
                    {fees.length === 0 ? <p className="text-muted-foreground text-center">No fees configured.</p> : null}
                    {fees.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-muted/50 p-3 rounded-lg border">
                            <div className="mb-2 sm:mb-0">
                                {item.region ? (
                                    <div className="font-medium text-base text-primary">
                                        Region: {item.region}
                                    </div>
                                ) : (
                                    <div className="font-medium text-base">
                                        {getName('country', item.country)}
                                        {item.state && ` > ${getName('state', item.state, item.country)}`}
                                        {item.city && ` > ${item.city}`}
                                    </div>
                                )}
                                <div className="text-sm text-muted-foreground">Price: ₦{item.price.toLocaleString()}</div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>Edit</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
