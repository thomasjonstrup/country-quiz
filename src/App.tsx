import {
	QueryClient,
	QueryClientProvider,
	useQuery,
} from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

import "./App.css"; // Assuming you have a CSS file for styles
import { useCallback, useMemo } from "react";
import { twMerge } from "tailwind-merge";

import CheckRoundedFill from "./resources/Check_round_fill.svg";
import CloseRoundedFill from "./resources/Close_round_fill.svg";

function App() {
	// Create a client
	const queryClient = new QueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<ReactQueryDevtools />
			<Quiz />
		</QueryClientProvider>
	);
}

export default App;

type Country = {
	name: {
		common: string;
		official: string;
		nativeName: {
			[key: string]: {
				common: string;
				official: string;
			};
		};
	};
	flags: {
		svg: string;
		alt: string;
	};
};

const Quiz = () => {
	const [selected, setSelected] = useState<string[]>([]);
	const [correct, setCorrect] = useState<string[]>([]);
	const [currentStep, setCurrentStep] = useState<number>(0);

	// Fetch quiz data using React Query
	const { isPending, error, data, isFetching } = useQuery<Country[]>({
		queryKey: ["quiz"],
		queryFn: async () => {
			// Simulate fetching quiz data
			const response = await fetch(
				"https://restcountries.com/v3.1/all?fields=name,flags"
			);

			const countries = (await response.json()) as Country[];
			// Shuffle countries and pick 10
			const shuffled = countries?.sort(() => Math.random() - 0.5);
			const quizCountries = shuffled?.slice(0, 10);
			// Add a flag to the first country for the quiz question
			return quizCountries;
		},
	});

	const correctCountry = useMemo(
		() => data?.[currentStep]?.name.common ?? "",
		[currentStep, data]
	);

	const handleSelect = useCallback(
		(selectedCountry: string) => {
			setSelected((prev) => [...prev, selectedCountry]);
			if (selectedCountry === correctCountry) {
				setCorrect((prev) => [...prev, selectedCountry]);
				setCurrentStep((prev) => prev + 1);
			}
		},
		[correctCountry]
	);

	if (isPending) {
		return <div className="loading">Loading...</div>;
	}
	if (error) {
		return <div className="error">Error: {error.message}</div>;
	}
	if (isFetching) {
		return <div className="fetching">Fetching new data...</div>;
	}

	return (
		<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32 g">
			<div className="flex items-center justify-between mb-8">
				<p className="text-white text-2xl">Country Quiz</p>
				<button
					className={twMerge(
						"bg-linear-to-r from-pink-500 to-purple-500 px-4 py-2 flex items-center gap-2 rounded-full"
					)}
				>
					<span className="text-white text-2xl">🏆</span>
					<span className="text-white text-2xl">4/10 Points</span>
				</button>
			</div>
			<div className="bg-blue-500 p-16 px-48 p-in rounded-xlg">
				<div className="flex gap-2 items-center mb-4">
					{data?.map((_country, index) => {
						const isSelected = index === currentStep;

						return (
							<button
								key={`step-${index}`}
								className={twMerge(
									"text-white rounded-full bg-blue-600 p-2",
									isSelected
										? "bg-linear-to-r from-pink-500 to-purple-500"
										: ""
								)}
							>
								{index + 1}
							</button>
						);
					})}
				</div>

				<p className="text-white text-2xl">
					Which country does this flag
					<img
						src={data?.[0].flags.svg}
						alt={data?.[0].flags.alt}
						className="inline-block w-12 h-12 mx-2"
					/>
					belong to?
				</p>

				<div className="grid grid-cols-2">
					{data?.map((country, index) => {
						const isSelected = selected.includes(
							country.name.common
						);

						const hasAnswered = selected[currentStep] !== undefined;

						const isCorrect = correct.includes(country.name.common);

						const rightAnswer =
							correctCountry === country.name.common;

						return (
							<button
								key={index}
								onClick={handleSelect.bind(
									null,
									country.name.common
								)}
								disabled={isSelected}
								className={twMerge(
									"inline-flex items-center bg-blue-600 text-white rounded-lg p-4 m-2 hover:bg-blue-600 hover:text-white transition-colors duration-300",
									isSelected
										? "bg-linear-to-r from-pink-500 to-purple-500"
										: ""
								)}
							>
								{hasAnswered && (rightAnswer || isCorrect) ? (
									<img
										src={CheckRoundedFill}
										alt="Correct"
										className="inline-block w-4 h-4 mr-2"
									/>
								) : null}

								{hasAnswered && isSelected && !isCorrect ? (
									<img
										src={CloseRoundedFill}
										alt="Incorrect"
										className="inline-block w-4 h-4 mr-2"
									/>
								) : null}

								{country.name.common}
							</button>
						);
					})}
				</div>
			</div>

			<div className="author-info">
				Coded by <a href="#">Your Name Here</a> | Challenge by
				<a
					href="https://www.devchallenges.io?ref=challenge"
					target="_blank"
				>
					devChallenges.io
				</a>
				.
			</div>
		</main>
	);
};

/*
    Country Quiz
    🏆 4/10 Points
    Which country does this flag 🇫🇮 belong to?
    Sweden
    Vietnam
    Finland
    Austria */
